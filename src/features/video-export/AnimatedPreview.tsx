// Live on-screen preview (M1). Every layer type shares the same
// resolveWorldTransform -> transformOps pipeline from scene.ts, so parented
// layers, easing, and blend modes all "just work" regardless of layer type.
//
// One real limitation worth flagging: parenting is resolved by walking
// scene.layers fresh on every derived-value recompute (cheap here, since
// scenes are small) — if compositions grow to hundreds of layers this
// should switch to a precomputed parent-chain lookup.

import React, { useEffect, useMemo, useState } from 'react';
import {
  Canvas,
  Fill,
  Group,
  Image as SkiaImage,
  RoundedRect,
  Oval,
  Text as SkiaText,
  useFont,
  useImage,
  rrect,
  rect,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { ImageLayer, Layer, Scene, ShapeLayer, TextLayer, VideoLayer } from './scene';
import { resolveWorldTransform, transformOps, SKIA_BLEND_MODE } from './scene';
import { extractVideoFrame } from '../../../modules/video-frame-decoder';

interface Props {
  scene: Scene;
  displayWidth: number;
  displayHeight: number;
}

export function AnimatedPreview({ scene, displayWidth, displayHeight }: Props) {
  const font72 = useFont(require('../../../assets/fonts/Inter-Bold.ttf'), 72);
  const font48 = useFont(require('../../../assets/fonts/Inter-Bold.ttf'), 48);
  const font40 = useFont(require('../../../assets/fonts/Inter-Bold.ttf'), 40);

  const currentTime = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    'worklet';
    const delta = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
    const next = currentTime.value + delta;
    currentTime.value = next >= scene.durationSeconds ? 0 : next;
  });

  const scaleX = displayWidth / scene.width;
  const scaleY = displayHeight / scene.height;

  const fontFor = (size: number) => (size >= 60 ? font72 : size >= 44 ? font48 : font40);

  return (
    <Canvas style={{ width: displayWidth, height: displayHeight }}>
      <Group transform={[{ scaleX }, { scaleY }]}>
        <Fill color={scene.backgroundColor} />
        {scene.layers.map((layer) => (
          <LayerNode key={layer.id} layer={layer} scene={scene} currentTime={currentTime} fontFor={fontFor} />
        ))}
      </Group>
    </Canvas>
  );
}

function LayerNode({
  layer,
  scene,
  currentTime,
  fontFor,
}: {
  layer: Layer;
  scene: Scene;
  currentTime: SharedValue<number>;
  fontFor: (size: number) => ReturnType<typeof useFont>;
}) {
  // width/height used for anchor-pivot math; text has no fixed box in this
  // engine yet, so its anchor pivots around (0,0) (top-left of the glyph
  // run) rather than a true bounding box.
  const width = 'width' in layer ? layer.width : 0;
  const height = 'height' in layer ? layer.height : 0;

  const transform = useDerivedValue(() => {
    const world = resolveWorldTransform(layer, scene.layers, currentTime.value);
    const ops = transformOps(world, width, height, layer.anchor);
    return [
      { translateX: ops.position.x },
      { translateY: ops.position.y },
      { translateX: ops.pivot.x },
      { translateY: ops.pivot.y },
      { rotate: ops.rotationRad },
      { skewX: ops.skewXRad },
      { scaleX: ops.scale.x },
      { scaleY: ops.scale.y },
      { translateX: -ops.pivot.x },
      { translateY: -ops.pivot.y },
    ];
  });

  const opacity = useDerivedValue(
    () => resolveWorldTransform(layer, scene.layers, currentTime.value).opacity
  );

  const blendMode = SKIA_BLEND_MODE[layer.blendMode] as any;

  if (layer.type === 'text') {
    const font = fontFor(layer.fontSize);
    if (!font) return null;
    return (
      <Group transform={transform} opacity={opacity} blendMode={blendMode}>
        <SkiaText text={layer.text} x={0} y={0} font={font} color={layer.color} />
      </Group>
    );
  }

  if (layer.type === 'shape') {
    return (
      <Group transform={transform} opacity={opacity} blendMode={blendMode}>
        <ShapeNode layer={layer} />
      </Group>
    );
  }

  if (layer.type === 'image') {
    return (
      <Group transform={transform} opacity={opacity} blendMode={blendMode}>
        <ImageNode layer={layer} />
      </Group>
    );
  }

  // video
  return (
    <Group transform={transform} opacity={opacity} blendMode={blendMode}>
      <VideoThumbnailNode layer={layer} />
    </Group>
  );
}

function ShapeNode({ layer }: { layer: ShapeLayer }) {
  const clip = useMemo(
    () => rrect(rect(0, 0, layer.width, layer.height), layer.cornerRadius, layer.cornerRadius),
    [layer.width, layer.height, layer.cornerRadius]
  );

  if (layer.shape === 'ellipse') {
    return (
      <>
        {layer.fill && <Oval x={0} y={0} width={layer.width} height={layer.height} color={layer.fill} />}
        {layer.stroke && (
          <Oval
            x={0}
            y={0}
            width={layer.width}
            height={layer.height}
            color={layer.stroke}
            style="stroke"
            strokeWidth={layer.strokeWidth}
          />
        )}
      </>
    );
  }

  return (
    <>
      {layer.fill && <RoundedRect rect={clip} color={layer.fill} />}
      {layer.stroke && <RoundedRect rect={clip} color={layer.stroke} style="stroke" strokeWidth={layer.strokeWidth} />}
    </>
  );
}

function ImageNode({ layer }: { layer: ImageLayer }) {
  const image = useImage(layer.uri ?? undefined);
  const clip = useMemo(
    () => rrect(rect(0, 0, layer.width, layer.height), layer.cornerRadius, layer.cornerRadius),
    [layer.width, layer.height, layer.cornerRadius]
  );

  if (!image) return <PlaceholderBox width={layer.width} height={layer.height} cornerRadius={layer.cornerRadius} tint="#2A2A35" />;

  return (
    <Group clip={clip}>
      <SkiaImage image={image} width={layer.width} height={layer.height} fit="cover" />
    </Group>
  );
}

/**
 * PLACEHOLDER PREVIEW ONLY (see README "Video decode module"). Shows a
 * single static thumbnail at the clip's trim-in point, not live playback.
 */
function VideoThumbnailNode({ layer }: { layer: VideoLayer }) {
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!layer.uri) {
      setThumbnail(undefined);
      return;
    }
    extractVideoFrame(layer.uri, layer.trimStart)
      .then((base64) => {
        if (!cancelled) setThumbnail(`data:image/png;base64,${base64}`);
      })
      .catch((err) => console.warn('Video thumbnail extraction failed', err));
    return () => {
      cancelled = true;
    };
  }, [layer.uri, layer.trimStart]);

  const image = useImage(thumbnail);
  const clip = useMemo(
    () => rrect(rect(0, 0, layer.width, layer.height), layer.cornerRadius, layer.cornerRadius),
    [layer.width, layer.height, layer.cornerRadius]
  );

  if (!image) return <PlaceholderBox width={layer.width} height={layer.height} cornerRadius={layer.cornerRadius} tint="#1D2A3A" />;

  return (
    <Group clip={clip}>
      <SkiaImage image={image} width={layer.width} height={layer.height} fit="cover" />
    </Group>
  );
}

function PlaceholderBox({
  width,
  height,
  cornerRadius,
  tint,
}: {
  width: number;
  height: number;
  cornerRadius: number;
  tint: string;
}) {
  return (
    <>
      <RoundedRect x={0} y={0} width={width} height={height} r={cornerRadius} color={tint} />
      <RoundedRect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        r={cornerRadius}
        color="#3A3A47"
        style="stroke"
        strokeWidth={2}
      />
    </>
  );
}
