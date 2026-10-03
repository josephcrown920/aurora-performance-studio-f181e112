import JSZip from 'jszip';
import type { TimelineDoc } from '@/features/creative-studio/lib/timeline-state';
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function imageBlob(src: string) {
  const response = await fetch(src); if (!response.ok) throw new Error('Image download failed.'); return response.blob();
}
export async function exportLayersZip(doc: TimelineDoc, name: string) {
  const zip = new JSZip(); zip.file('timeline.json', JSON.stringify(doc, null, 2));
  const images = doc.clips.filter(clip => clip.kind === 'image' && clip.src);
  for (const [index, clip] of images.entries()) {
    if (!clip.src) continue;
    const blob = await imageBlob(clip.src);
    zip.file(`shot-${String(index + 1).padStart(3, '0')}.${blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png'}`, blob);
  }
  downloadBlob(await zip.generateAsync({ type: 'blob' }), `${name.replace(/[^a-zA-Z0-9-]/g, '-') || 'aurora-layers'}.zip`);
}
export async function exportLayerPng(src: string) {
  const bitmap = await createImageBitmap(await imageBlob(src));
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Image export unavailable.');
  context.drawImage(bitmap, 0, 0); bitmap.close();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Image export failed.'); downloadBlob(blob, 'aurora-layer.png');
}
export async function exportContactSheet(doc: TimelineDoc) {
  const images = doc.clips.filter(clip => clip.kind === 'image' && clip.src);
  if (!images.length) throw new Error('No image shots to compose.');
  const columns = Math.min(3, images.length); const width = 640; const height = 480;
  const canvas = document.createElement('canvas'); canvas.width = columns * width; canvas.height = Math.ceil(images.length / columns) * height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Composite export unavailable.');
  for (const [index, clip] of images.entries()) {
    if (!clip.src) continue;
    const bitmap = await createImageBitmap(await imageBlob(clip.src));
    const scale = Math.min(width / bitmap.width, height / bitmap.height);
    context.drawImage(bitmap, (index % columns) * width + (width - bitmap.width * scale) / 2, Math.floor(index / columns) * height + (height - bitmap.height * scale) / 2, bitmap.width * scale, bitmap.height * scale); bitmap.close();
  }
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Composite export failed.'); downloadBlob(blob, 'aurora-contact-sheet.png');
}
