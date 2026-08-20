// Live on-screen preview. Runs the scene on a loop using Reanimated's
// useFrameCallback to drive a shared "currentTime" value, then derives
// per-layer position/opacity/scale from the same interpolation helpers
// used at export time.

import React, { useMemo } from 'react';
import {
  Canvas,
  Fill,
  Group,
  Image as SkiaImage,
  RoundedRect,
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
import type { ImageLayer, Scene, TextLayer } from './scene';
import { interpolateNumber, interpolateVec2 } from './scene';

interface Props {
  scene: Scene;
  displayWidth: number;
  displayHeight: number;
}

export function AnimatedPreview({ scene, displayWidth, displayHeight }: Props) {
  const font72 = useFont(require('../../../assets/fonts/Inter-Bold.ttf'), 72);
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

  return (
    <Canvas style={{ width: displayWidth, height: displayHeight }}>
      <Group transform={[{ scaleX }, { scaleY }]}>
        <Fill color={scene.backgroundColor} />
        {scene.layers.map((layer) =>
          layer.type === 'text' ? (
            <TextLayerNode
              key={layer.id}
              layer={layer}
              currentTime={currentTime}
              font={layer.fontSize >= 60 ? font72 : font40}
            />
          ) : (
            <ImageLayerNode key={layer.id} layer={layer} currentTime={currentTime} />
          )
        )}
      </Group>
    </Canvas>
  );
}

function TextLayerNode({
  layer,
  currentTime,
  font,
}: {
  layer: TextLayer;
  currentTime: SharedValue<number>;
  font: ReturnType<typeof useFont>;
}) {
  const x = useDerivedValue(() => interpolateVec2(layer.position, currentTime.value).x);
  const y = useDerivedValue(() => interpolateVec2(layer.position, currentTime.value).y);
  const opacity = useDerivedValue(() => interpolateNumber(layer.opacity, currentTime.value));

  if (!font) return null;

  return <SkiaText text={layer.text} x={x} y={y} font={font} color={layer.color} opacity={opacity} />;
}

function ImageLayerNode({
  layer,
  currentTime,
}: {
  layer: ImageLayer;
  currentTime: SharedValue<number>;
}) {
  const image = useImage(layer.uri ?? undefined);

  const x = useDerivedValue(() => interpolateVec2(layer.position, currentTime.value).x);
  const y = useDerivedValue(() => interpolateVec2(layer.position, currentTime.value).y);
  const opacity = useDerivedValue(() => interpolateNumber(layer.opacity, currentTime.value));
  const scale = useDerivedValue(() => interpolateNumber(layer.scale, currentTime.value));

  const clip = useMemo(
    () => rrect(rect(0, 0, layer.width, layer.height), layer.cornerRadius, layer.cornerRadius),
    [layer.width, layer.height, layer.cornerRadius]
  );

  const transform = useDerivedValue(() => [
    { translateX: x.value },
    { translateY: y.value },
    { scale: scale.value },
  ]);

  return (
    <Group transform={transform} opacity={opacity}>
      {image ? (
        <Group clip={clip}>
          <SkiaImage image={image} width={layer.width} height={layer.height} fit="cover" />
        </Group>
      ) : (
        <Group>
          <RoundedRect x={0} y={0} width={layer.width} height={layer.height} r={layer.cornerRadius} color="#2A2A35" />
          <RoundedRect
            x={2}
            y={2}
            width={layer.width - 4}
            height={layer.height - 4}
            r={layer.cornerRadius}
            color="#3A3A47"
            style="stroke"
            strokeWidth={2}
          />
        </Group>
      )}
    </Group>
  );
}
