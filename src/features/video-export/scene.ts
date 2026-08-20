// Plain data model for a "motion design" scene: a list of layers, each with
// keyframed position/opacity/scale. This same model drives both the live
// on-screen preview (declarative Skia + Reanimated) and the offline video
// export (imperative Skia canvas), so what you see in the editor is what
// gets rendered into the mp4.

export type Vec2 = { x: number; y: number };

export interface Keyframe<T> {
  time: number; // seconds, relative to scene start
  value: T;
}

export interface BaseLayer {
  id: string;
  position: Keyframe<Vec2>[];
  opacity: Keyframe<number>[];
  scale: Keyframe<number>[];
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  // Local file uri once the user picks a photo, or null to render the
  // placeholder box (gray card).
  uri: string | null;
  width: number;
  height: number;
  cornerRadius: number;
}

export type Layer = TextLayer | ImageLayer;

export interface Scene {
  id: string;
  durationSeconds: number;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
}

// --- Interpolation -----------------------------------------------------
// Deliberately framework-agnostic (no Reanimated import) so this same
// function can run as a plain JS call during export, and be wrapped in a
// worklet on the UI thread during preview.

function lerp(a: number, b: number, t: number) {
  'worklet';
  return a + (b - a) * t;
}

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
      return lerp(a.value, b.value, localT);
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
      return {
        x: lerp(a.value.x, b.value.x, localT),
        y: lerp(a.value.y, b.value.y, localT),
      };
    }
  }
  return last.value;
}

// Deep-clones a scene so editing one instance (e.g. after picking it from a
// template list) never mutates the shared template definition.
export function cloneScene(scene: Scene): Scene {
  return JSON.parse(JSON.stringify(scene));
}
