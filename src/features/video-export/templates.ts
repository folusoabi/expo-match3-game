import type { Scene, Layer } from './scene';
import { defaultProperties, staticProp } from './scene';

export interface Template {
  id: string;
  label: string;
  scene: Scene;
}

// --- Product Reveal -------------------------------------------------
// Exercises: video layer, image layer with easeOut position, staggered
// text reveals with easing.

const productReveal: Scene = {
  id: 'product-reveal',
  durationSeconds: 3,
  width: 1080,
  height: 1920,
  backgroundColor: '#0F0F14',
  layers: [
    {
      id: 'background-clip',
      type: 'video',
      uri: null,
      trimStart: 0,
      trimEnd: 3,
      width: 1080,
      height: 1920,
      cornerRadius: 0,
      anchor: { x: 0, y: 0 },
      blendMode: 'normal',
      properties: defaultProperties({ x: 0, y: 0 }),
    },
    {
      id: 'hero-image',
      type: 'image',
      uri: null,
      width: 800,
      height: 800,
      cornerRadius: 32,
      anchor: { x: 0, y: 0 },
      blendMode: 'normal',
      properties: {
        position: [
          { time: 0, value: { x: 140, y: 500 }, easing: 'easeOut' },
          { time: 1, value: { x: 140, y: 420 } },
        ],
        scale: [
          { time: 0, value: { x: 0.85, y: 0.85 }, easing: 'easeOut' },
          { time: 1, value: { x: 1, y: 1 } },
        ],
        rotation: staticProp(0),
        skewX: staticProp(0),
        opacity: [
          { time: 0, value: 0 },
          { time: 0.6, value: 1 },
        ],
      },
    },
    {
      id: 'headline',
      type: 'text',
      text: 'Introducing Something New',
      color: '#FFFFFF',
      fontSize: 72,
      anchor: { x: 0, y: 0 },
      blendMode: 'normal',
      properties: {
        position: [
          { time: 0.5, value: { x: 90, y: 1420 }, easing: 'easeOut' },
          { time: 1.4, value: { x: 90, y: 1340 } },
        ],
        scale: staticProp({ x: 1, y: 1 }),
        rotation: staticProp(0),
        skewX: staticProp(0),
        opacity: [
          { time: 0.5, value: 0 },
          { time: 1.2, value: 1 },
        ],
      },
    },
    {
      id: 'subtext',
      type: 'text',
      text: 'Available now',
      color: '#B9B9C6',
      fontSize: 40,
      anchor: { x: 0, y: 0 },
      blendMode: 'normal',
      properties: {
        position: staticProp({ x: 90, y: 1460 }),
        scale: staticProp({ x: 1, y: 1 }),
        rotation: staticProp(0),
        skewX: staticProp(0),
        opacity: [
          { time: 1.5, value: 0 },
          { time: 2.3, value: 1 },
        ],
      },
    },
  ],
};

// --- Parenting & Blend Rig -------------------------------------------
// Purpose-built M1 demo: a "hand -> phone -> screen glow" rig. Moving/
// rotating the parent (hand) carries the phone and screen glow with it,
// and the glow shape uses a "screen" blend mode over the phone body.

const parentingDemoLayers: Layer[] = [
  {
    id: 'hand',
    type: 'shape',
    shape: 'rect',
    width: 260,
    height: 120,
    fill: '#C48A5A',
    stroke: null,
    strokeWidth: 0,
    cornerRadius: 40,
    anchor: { x: 0.5, y: 0.5 },
    blendMode: 'normal',
    properties: {
      position: [
        { time: 0, value: { x: 300, y: 1500 }, easing: 'easeInOut' },
        { time: 1.5, value: { x: 540, y: 1200 }, easing: 'easeInOut' },
        { time: 3, value: { x: 300, y: 1500 } },
      ],
      scale: staticProp({ x: 1, y: 1 }),
      rotation: [
        { time: 0, value: -8, easing: 'easeInOut' },
        { time: 1.5, value: 8, easing: 'easeInOut' },
        { time: 3, value: -8 },
      ],
      skewX: staticProp(0),
      opacity: staticProp(1),
    },
  },
  {
    id: 'phone',
    type: 'shape',
    shape: 'rect',
    width: 220,
    height: 440,
    fill: '#1A1A22',
    stroke: '#3A3A47',
    strokeWidth: 4,
    cornerRadius: 28,
    anchor: { x: 0.5, y: 0.9 },
    parentId: 'hand',
    blendMode: 'normal',
    properties: {
      // Position is relative to the parent's local space (0,0 = sits
      // right where the hand is, since it's parented).
      position: staticProp({ x: 0, y: -60 }),
      scale: staticProp({ x: 1, y: 1 }),
      rotation: staticProp(0),
      skewX: staticProp(0),
      opacity: staticProp(1),
    },
  },
  {
    id: 'screen-glow',
    type: 'shape',
    shape: 'ellipse',
    width: 180,
    height: 180,
    fill: '#4C6FFF',
    stroke: null,
    strokeWidth: 0,
    cornerRadius: 0,
    anchor: { x: 0.5, y: 0.5 },
    parentId: 'phone',
    blendMode: 'screen',
    properties: {
      position: staticProp({ x: 0, y: -220 }),
      scale: [
        { time: 0, value: { x: 0.6, y: 0.6 }, easing: 'easeInOut' },
        { time: 1.5, value: { x: 1.1, y: 1.1 }, easing: 'easeInOut' },
        { time: 3, value: { x: 0.6, y: 0.6 } },
      ],
      rotation: staticProp(0),
      skewX: staticProp(0),
      opacity: staticProp(0.9),
    },
  },
  {
    id: 'caption',
    type: 'text',
    text: 'Parenting + blend modes',
    color: '#FFFFFF',
    fontSize: 48,
    anchor: { x: 0, y: 0 },
    blendMode: 'normal',
    properties: {
      position: staticProp({ x: 90, y: 300 }),
      scale: staticProp({ x: 1, y: 1 }),
      rotation: staticProp(0),
      skewX: staticProp(0),
      opacity: [
        { time: 0, value: 0 },
        { time: 0.5, value: 1 },
      ],
    },
  },
];

const parentingDemo: Scene = {
  id: 'parenting-demo',
  durationSeconds: 3,
  width: 1080,
  height: 1920,
  backgroundColor: '#0A0A0F',
  layers: parentingDemoLayers,
};

export const templates: Template[] = [
  { id: 'product-reveal', label: 'Product Reveal', scene: productReveal },
  { id: 'parenting-demo', label: 'M1 Demo: Parenting & Blend', scene: parentingDemo },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
