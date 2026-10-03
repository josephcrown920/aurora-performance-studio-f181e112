import { supabase } from '@/integrations/supabase/client';
import type { TimelineDoc } from '@/features/creative-studio/lib/timeline-state';

export type LayerAsset = { path: string; name: string };
export type LayersProject = {
  version: 1; id: string; name: string; prompt: string; lockIdentity: boolean;
  source?: LayerAsset; character?: LayerAsset;
  edits: Record<string, { prompt: string; asset?: LayerAsset }>;
  timeline: TimelineDoc; updatedAt: string;
};
export async function studioOwner() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sign in to save or render your Layers project.');
  return data.user.id;
}
export async function uploadLayerImage(src: string, name: string): Promise<LayerAsset> {
  const owner = await studioOwner();
  const response = await fetch(src);
  if (!response.ok) throw new Error('Could not read the image.');
  const blob = await response.blob();
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(blob.type)) throw new Error('Use a JPG, PNG or WebP image.');
  if (blob.size > 20 * 1024 * 1024) throw new Error('Images must be smaller than 20 MB.');
  const path = `${owner}/layers/${crypto.randomUUID()}.${blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png'}`;
  const { error } = await supabase.storage.from('layers-private').upload(path, blob, { contentType: blob.type });
  if (error) throw new Error(error.message);
  return { path, name };
}
export async function layerImageUrl(asset: LayerAsset) {
  const owner = await studioOwner();
  if (!asset.path.startsWith(`${owner}/layers/`)) throw new Error('This image belongs to a different project owner.');
  const { data, error } = await supabase.storage.from('layers-private').createSignedUrl(asset.path, 86400);
  if (error || !data) throw new Error(error?.message ?? 'Image unavailable.');
  return data.signedUrl;
}
export async function listLayersProjects() {
  const owner = await studioOwner();
  const { data, error } = await supabase.storage.from('layers-private').list(`${owner}/layers-projects`, { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } });
  if (error) throw new Error(error.message);
  return data.filter(file => file.name.endsWith('.json')).map(file => ({ id: file.name.slice(0, -5), name: file.name.slice(0, -5) }));
}
export async function saveLayersProject(project: LayersProject) {
  const owner = await studioOwner();
  if (!/^[a-zA-Z0-9-]+$/.test(project.id)) throw new Error('Invalid project ID.');
  const { error } = await supabase.storage.from('layers-private').upload(`${owner}/layers-projects/${project.id}.json`, new Blob([JSON.stringify(project)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
  if (error) throw new Error(error.message);
}
export async function loadLayersProject(id: string): Promise<LayersProject> {
  const owner = await studioOwner();
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error('Invalid project ID.');
  const { data, error } = await supabase.storage.from('layers-private').download(`${owner}/layers-projects/${id}.json`);
  if (error || !data) throw new Error(error?.message ?? 'Project unavailable.');
  const project: LayersProject = JSON.parse(await data.text());
  if (project.version !== 1 || project.id !== id || !Array.isArray(project.timeline?.clips)) throw new Error('Unsupported project format.');
  return project;
}
export async function removeLayersProject(id: string) {
  const owner = await studioOwner();
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error('Invalid project ID.');
  const { error } = await supabase.storage.from('layers-private').remove([`${owner}/layers-projects/${id}.json`]);
  if (error) throw new Error(error.message);
}
