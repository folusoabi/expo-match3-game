import type { Scene } from './scene';

export interface Template {
  id: string;
  label: string;
  scene: Scene;
}

const productReveal: Scene = {
  id: 'product-reveal',
  durationSeconds: 3,
  width: 1080,
  height: 1920,
  backgroundColor: '#0F0F14',
  layers: [
    {
      id: 'hero-image',
      type: 'image',
      uri: null,
      width: 800,
      height: 800,
      cornerRadius: 32,
      position: [
        { time: 0, value: { x: 140, y: 500 } },
        { time: 1, value: { x: 140, y: 420 } },
      ],
      opacity: [
        { time: 0, value: 0 },
        { time: 0.6, value: 1 },
      ],
      scale: [
        { time: 0, value: 0.85 },
        { time: 1, value: 1 },
      ],
    },
    {
      id: 'headline',
      type: 'text',
      text: 'Introducing Something New',
      color: '#FFFFFF',
      fontSize: 72,
      position: [
        { time: 0.5, value: { x: 90, y: 1420 } },
        { time: 1.4, value: { x: 90, y: 1340 } },
      ],
      opacity: [
        { time: 0.5, value: 0 },
        { time: 1.2, value: 1 },
      ],
      scale: [{ time: 0.5, value: 1 }],
    },
    {
      id: 'subtext',
      type: 'text',
      text: 'Available now',
      color: '#B9B9C6',
      fontSize: 40,
      position: [{ time: 1.5, value: { x: 90, y: 1460 } }],
      opacity: [
        { time: 1.5, value: 0 },
        { time: 2.3, value: 1 },
      ],
      scale: [{ time: 1.5, value: 1 }],
    },
  ],
};

const saleAnnouncement: Scene = {
  id: 'sale-announcement',
  durationSeconds: 2.5,
  width: 1080,
  height: 1920,
  backgroundColor: '#1A0F14',
  layers: [
    {
      id: 'badge',
      type: 'text',
      text: '30% OFF',
      color: '#FF5A5F',
      fontSize: 96,
      position: [
        { time: 0, value: { x: 90, y: 900 } },
        { time: 0.5, value: { x: 90, y: 820 } },
      ],
      opacity: [
        { time: 0, value: 0 },
        { time: 0.4, value: 1 },
      ],
      scale: [
        { time: 0, value: 0.6 },
        { time: 0.5, value: 1 },
      ],
    },
    {
      id: 'product-shot',
      type: 'image',
      uri: null,
      width: 900,
      height: 600,
      cornerRadius: 24,
      position: [{ time: 0.8, value: { x: 90, y: 1000 } }],
      opacity: [
        { time: 0.8, value: 0 },
        { time: 1.4, value: 1 },
      ],
      scale: [{ time: 0.8, value: 1 }],
    },
    {
      id: 'cta',
      type: 'text',
      text: 'Ends Sunday — Shop now',
      color: '#FFFFFF',
      fontSize: 44,
      position: [{ time: 1.6, value: { x: 90, y: 1680 } }],
      opacity: [
        { time: 1.6, value: 0 },
        { time: 2.2, value: 1 },
      ],
      scale: [{ time: 1.6, value: 1 }],
    },
  ],
};

export const templates: Template[] = [
  { id: 'product-reveal', label: 'Product Reveal', scene: productReveal },
  { id: 'sale-announcement', label: 'Sale Announcement', scene: saleAnnouncement },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
