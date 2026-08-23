// The generalized composition engine (M1). Every visual layer shares the
// same property/keyframe/easing/parenting/blend-mode system, so adding a
// new layer type (shape, video, later 3D, etc.) never means inventing a
// new animation model — only new drawing code.

export type Vec2 = { x: number; y: number };

export type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'hold';
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'hardLight'
  | 'softLight'
  | 'colorDodge'
  | 'colorBurn';

export interface Keyframe<T> {
  time: number; // seconds, relative to composition start
  value: T;
  // Easing applied to the segment FROM this keyframe TO the next one.
  // Ignored on the last keyframe.
  easing?: Easing;
}

/** Every animatable property a layer can have. */
export interface LayerProperties {
  position: Keyframe<Vec2>[];
  scale: Keyframe<Vec2>[]; // independent x/y, e.g. { x: 1, y: 1 } = 100%
  rotation: Keyframe<number>[]; // degrees
  skewX: Keyframe<number>[]; // degrees
  opacity: Keyframe<number>[]; // 0..1
}

export interface BaseLayer {
  id: string;
  // Normalized 0..1 pivot for rotation/scale, relative to the layer's own
  // width/height. { x: 0.5, y: 0.5 } = center. Static for now (not
  // animated) — revisit if a use case needs an animated anchor.
  anchor: Vec2;
  // If set, this layer's resolved transform is composed on top of the
  // parent layer's resolved transform at the same time t.
  parentId?: string;
  blendMode: BlendMode;
  properties: LayerProperties;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  uri: string | null;
  width: number;
  height: number;
  cornerRadius: number;
}

export interface VideoLayer extends BaseLayer {
  type: 'video';
  uri: string | null;
  trimStart: number;
  trimEnd: number;
  width: number;
  height: number;
  cornerRadius: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rect' | 'ellipse';
  width: number;
  height: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  cornerRadius: number; // rect only
}

export type Layer = TextLayer | ImageLayer | VideoLayer | ShapeLayer;

export interface Scene {
  id: string;
  durationSeconds: number;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
}

// --- Easing --------------------------------------------------------------

function easeFactor(localT: number, easing: Easing | undefined): number {
  'worklet';
  switch (easing) {
    case 'hold':
      return 0;
    case 'easeIn':
      return localT * localT;
    case 'easeOut':
      return 1 - (1 - localT) * (1 - localT);
    case 'easeInOut':
      return localT < 0.5 ? 2 * localT * localT : 1 - Math.pow(-2 * localT + 2, 2) / 2;
    default:
      return localT; // linear
  }
}

function lerp(a: number, b: number, t: number) {
  'worklet';
  return a + (b - a) * t;
}

// --- Interpolation ---------------------------------------------------
// Framework-agnostic (no Reanimated import) so the same function runs as
// a plain JS call during export and as a worklet during live preview.

export function interpolateNumber(keyframes: Keyframe<number>[], t: number): number {
  'worklet';
  if (keyframes.length === 0) return 0;
  if (t <= keyframes[0].time) return keyframes[0].value;
  const last = keyframes[keyframes.length - 1];
  if (t >= last.time) return last.value;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (t >= a.time && t <= b.time) {
      const span = b.time - a.time || 1;
      const localT = (t - a.time) / span;
      const factor = easeFactor(localT, a.easing);
      return lerp(a.value, b.value, factor);
    }
  }
  return last.value;
}

export function interpolateVec2(keyframes: Keyframe<Vec2>[], t: number): Vec2 {
  'worklet';
  if (keyframes.length === 0) return { x: 0, y: 0 };
  if (t <= keyframes[0].time) return keyframes[0].value;
  const last = keyframes[keyframes.length - 1];
  if (t >= last.time) return last.value;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (t >= a.time && t <= b.time) {
      const span = b.time - a.time || 1;
      const localT = (t - a.time) / span;
      const factor = easeFactor(localT, a.easing);
      return {
        x: lerp(a.value.x, b.value.x, factor),
        y: lerp(a.value.y, b.value.y, factor),
      };
    }
  }
  return last.value;
}

/** A layer's fully resolved transform at time t, before parenting. */
export interface ResolvedTransform {
  position: Vec2;
  scale: Vec2;
  rotation: number;
  skewX: number;
  opacity: number;
}

export function resolveOwnTransform(layer: BaseLayer, t: number): ResolvedTransform {
  'worklet';
  return {
    position: interpolateVec2(layer.properties.position, t),
    scale: interpolateVec2(layer.properties.scale, t),
    rotation: interpolateNumber(layer.properties.rotation, t),
    skewX: interpolateNumber(layer.properties.skewX, t),
    opacity: interpolateNumber(layer.properties.opacity, t),
  };
}

/**
 * Resolves a layer's transform combined with its parent chain, walking up
 * as far as parentId links go. Parent position/rotation/scale compose;
 * parent opacity multiplies down. Cycles are not detected — don't create
 * parent loops.
 */
export function resolveWorldTransform(layer: BaseLayer, allLayers: Layer[], t: number): ResolvedTransform {
  'worklet';
  const own = resolveOwnTransform(layer, t);
  if (!layer.parentId) return own;

  const parent = allLayers.find((l) => l.id === layer.parentId);
  if (!parent) return own;

  const parentWorld = resolveWorldTransform(parent, allLayers, t);

  // Compose: rotate/scale the child's local offset by the parent's
  // rotation+scale, then add the parent's position. Skew is not composed
  // through the parent chain (each layer's own skew stays local) — fine
  // for the "hand -> phone -> screen" style rig this is meant for.
  const rad = (parentWorld.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const scaledX = own.position.x * parentWorld.scale.x;
  const scaledY = own.position.y * parentWorld.scale.y;

  return {
    position: {
      x: parentWorld.position.x + scaledX * cos - scaledY * sin,
      y: parentWorld.position.y + scaledX * sin + scaledY * cos,
    },
    scale: {
      x: own.scale.x * parentWorld.scale.x,
      y: own.scale.y * parentWorld.scale.y,
    },
    rotation: own.rotation + parentWorld.rotation,
    skewX: own.skewX,
    opacity: own.opacity * parentWorld.opacity,
  };
}

/**
 * Builds the ordered transform ops (translate to position, translate to
 * anchor pivot, rotate, skew, scale, translate back) used identically by
 * both the declarative Skia preview and the imperative export canvas, so
 * the two renderers can never visually drift apart.
 */
export function transformOps(resolved: ResolvedTransform, width: number, height: number, anchor: Vec2) {
  'worklet';
  const pivotX = anchor.x * width;
  const pivotY = anchor.y * height;
  return {
    position: resolved.position,
    pivot: { x: pivotX, y: pivotY },
    rotationRad: (resolved.rotation * Math.PI) / 180,
    skewXRad: (resolved.skewX * Math.PI) / 180,
    scale: resolved.scale,
  };
}

export function cloneScene(scene: Scene): Scene {
  return JSON.parse(JSON.stringify(scene));
}

/** Maps our BlendMode strings to @shopify/react-native-skia's BlendMode enum names. */
export const SKIA_BLEND_MODE: Record<BlendMode, string> = {
  normal: 'srcOver',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  difference: 'difference',
  exclusion: 'exclusion',
  hardLight: 'hardLight',
  softLight: 'softLight',
  colorDodge: 'colorDodge',
  colorBurn: 'colorBurn',
};

// --- Convenience constructors ---------------------------------------
// Most layers start with a single static keyframe per property; these
// helpers keep template definitions readable.

export function staticProp<T>(value: T): Keyframe<T>[] {
  return [{ time: 0, value }];
}

export function defaultProperties(position: Vec2 = { x: 0, y: 0 }): LayerProperties {
  return {
    position: staticProp(position),
    scale: staticProp({ x: 1, y: 1 }),
    rotation: staticProp(0),
    skewX: staticProp(0),
    opacity: staticProp(1),
  };
}
