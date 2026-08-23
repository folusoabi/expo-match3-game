// Renders a Scene to an mp4 entirely on-device. Uses the exact same
// resolveWorldTransform/transformOps helpers as AnimatedPreview.tsx so
// parenting, easing, and blend modes render identically in both places —
// only the drawing calls differ (imperative canvas here vs declarative
// Skia components there).

import { Skia } from '@shopify/react-native-skia';
import { VideoFrameEncoderSession } from '../../../modules/video-frame-encoder';
import { extractVideoFrame } from '../../../modules/video-frame-decoder';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import type { Layer, Scene, ShapeLayer } from './scene';
import { resolveWorldTransform, transformOps, SKIA_BLEND_MODE } from './scene';

export interface ExportProgress {
  fractionComplete: number; // 0..1
}

const FPS = 30;

export async function exportSceneToVideo(
  scene: Scene,
  onProgress?: (p: ExportProgress) => void
): Promise<string> {
  const outputPath = `${FileSystem.cacheDirectory}scene-${scene.id}-${Date.now()}.mp4`;

  const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(
    await loadFontData(require('../../../assets/fonts/Inter-Bold.ttf'))
  );
  const fontCache = new Map<number, ReturnType<typeof Skia.Font>>();
  const fontFor = (size: number) => {
    if (!fontCache.has(size)) fontCache.set(size, Skia.Font(typeface, size));
    return fontCache.get(size)!;
  };

  const imageCache = new Map<string, ReturnType<typeof Skia.Image.MakeImageFromEncoded>>();
  for (const layer of scene.layers) {
    if (layer.type === 'image' && layer.uri) {
      const base64 = await FileSystem.readAsStringAsync(layer.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      imageCache.set(layer.uri, Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(base64)));
    }
  }

  const surface = Skia.Surface.Make(scene.width, scene.height);
  if (!surface) throw new Error('Could not create offscreen Skia surface');
  const canvas = surface.getCanvas();

  const session = await VideoFrameEncoderSession.start({
    width: scene.width,
    height: scene.height,
    fps: FPS,
    bitRate: 6_000_000,
    outputPath,
  });

  const totalFrames = Math.ceil(scene.durationSeconds * FPS);

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / FPS;

    // Video layers need a freshly decoded source frame every output frame
    // (see modules/video-frame-decoder README section on cost).
    const videoFrames = new Map<string, ReturnType<typeof Skia.Image.MakeImageFromEncoded>>();
    for (const layer of scene.layers) {
      if (layer.type === 'video' && layer.uri) {
        const sourceTime = Math.min(Math.max(layer.trimStart + t, layer.trimStart), layer.trimEnd);
        const pngBase64 = await extractVideoFrame(layer.uri, sourceTime);
        videoFrames.set(layer.id, Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(pngBase64)));
      }
    }

    canvas.clear(Skia.Color(scene.backgroundColor));
    drawLayers(canvas, scene, t, fontFor, imageCache, videoFrames);
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const pngBase64 = bytesToBase64(snapshot.encodeToBytes());

    await session.appendFrame(pngBase64, t);
    onProgress?.({ fractionComplete: (frame + 1) / totalFrames });
  }

  return session.finish();
}

function applyTransform(canvas: any, layer: Layer, scene: Scene, t: number): number {
  const world = resolveWorldTransform(layer, scene.layers, t);
  const width = 'width' in layer ? layer.width : 0;
  const height = 'height' in layer ? layer.height : 0;
  const ops = transformOps(world, width, height, layer.anchor);

  canvas.translate(ops.position.x, ops.position.y);
  canvas.translate(ops.pivot.x, ops.pivot.y);
  canvas.rotate((ops.rotationRad * 180) / Math.PI, 0, 0); // Skia's canvas.rotate takes degrees
  canvas.skew(Math.tan(ops.skewXRad), 0);
  canvas.scale(ops.scale.x, ops.scale.y);
  canvas.translate(-ops.pivot.x, -ops.pivot.y);

  return world.opacity;
}

function drawLayers(
  canvas: any,
  scene: Scene,
  t: number,
  fontFor: (size: number) => any,
  imageCache: Map<string, any>,
  videoFrames: Map<string, any>
) {
  for (const layer of scene.layers) {
    canvas.save();
    const opacity = applyTransform(canvas, layer, scene, t);
    if (opacity <= 0) {
      canvas.restore();
      continue;
    }

    const blendMode = SKIA_BLEND_MODE[layer.blendMode];

    if (layer.type === 'text') {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color(layer.color));
      paint.setAlphaf(opacity);
      paint.setBlendMode(Skia.BlendMode[blendMode as keyof typeof Skia.BlendMode]);
      canvas.drawText(layer.text, 0, 0, paint, fontFor(layer.fontSize));
    } else if (layer.type === 'shape') {
      drawShape(canvas, layer, opacity, blendMode);
    } else {
      // image or video
      const rr = Skia.RRectXY(Skia.XYWHRect(0, 0, layer.width, layer.height), layer.cornerRadius, layer.cornerRadius);
      const image = layer.type === 'image' ? (layer.uri ? imageCache.get(layer.uri) : null) : videoFrames.get(layer.id);

      if (image) {
        canvas.save();
        canvas.clipRRect(rr, true);
        const paint = Skia.Paint();
        paint.setAlphaf(opacity);
        paint.setBlendMode(Skia.BlendMode[blendMode as keyof typeof Skia.BlendMode]);
        canvas.drawImageRect(
          image,
          Skia.XYWHRect(0, 0, image.width(), image.height()),
          Skia.XYWHRect(0, 0, layer.width, layer.height),
          paint
        );
        canvas.restore();
      } else {
        const fillPaint = Skia.Paint();
        fillPaint.setColor(Skia.Color('#2A2A35'));
        fillPaint.setAlphaf(opacity);
        canvas.drawRRect(rr, fillPaint);
      }
    }

    canvas.restore();
  }
}

function drawShape(canvas: any, layer: ShapeLayer, opacity: number, blendMode: string) {
  const rr = Skia.RRectXY(Skia.XYWHRect(0, 0, layer.width, layer.height), layer.cornerRadius, layer.cornerRadius);
  const oval = Skia.XYWHRect(0, 0, layer.width, layer.height);

  if (layer.fill) {
    const fillPaint = Skia.Paint();
    fillPaint.setColor(Skia.Color(layer.fill));
    fillPaint.setAlphaf(opacity);
    fillPaint.setBlendMode(Skia.BlendMode[blendMode as keyof typeof Skia.BlendMode]);
    if (layer.shape === 'ellipse') {
      canvas.drawOval(oval, fillPaint);
    } else {
      canvas.drawRRect(rr, fillPaint);
    }
  }
  if (layer.stroke) {
    const strokePaint = Skia.Paint();
    strokePaint.setColor(Skia.Color(layer.stroke));
    strokePaint.setAlphaf(opacity);
    strokePaint.setStyle(1); // Stroke
    strokePaint.setStrokeWidth(layer.strokeWidth);
    strokePaint.setBlendMode(Skia.BlendMode[blendMode as keyof typeof Skia.BlendMode]);
    if (layer.shape === 'ellipse') {
      canvas.drawOval(oval, strokePaint);
    } else {
      canvas.drawRRect(rr, strokePaint);
    }
  }
}

async function loadFontData(mod: number): Promise<ArrayBuffer> {
  const asset = Asset.fromModule(mod);
  await asset.downloadAsync();
  const b64 = await FileSystem.readAsStringAsync(asset.localUri!, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToBytes(b64).buffer;
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = globalThis.atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return globalThis.btoa(binary);
}
