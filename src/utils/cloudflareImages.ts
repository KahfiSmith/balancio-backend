import { config } from '@/config/config';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

const requireConfig = () => {
  if (!config.CLOUDFLARE_ACCOUNT_ID || !config.CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare Images not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN');
  }
};

export interface CFUploadResult {
  id: string;
  filename: string;
  uploaded: string;
  variants?: string[];
}

export async function cfUploadImage(opts: { buffer: Buffer; filename: string; mime?: string; requireSignedURLs?: boolean; metadata?: Record<string, any>; }): Promise<CFUploadResult> {
  requireConfig();
  const { buffer, filename, mime, requireSignedURLs, metadata } = opts;

  const form = new FormData();
  const blob = new Blob([buffer], { type: mime || 'application/octet-stream' });
  form.append('file', blob, filename);
  if (typeof requireSignedURLs === 'boolean') form.append('requireSignedURLs', String(requireSignedURLs));
  if (metadata) form.append('metadata', JSON.stringify(metadata));

  const url = `${CF_API_BASE}/accounts/${config.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}`,
    },
    body: form as any,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Cloudflare upload failed: ${resp.status} ${resp.statusText} - ${text}`);
  }

  const json: any = await resp.json();
  if (!json.success) {
    throw new Error(`Cloudflare upload error: ${JSON.stringify((json as any).errors || json)}`);
  }

  const r = json.result;
  return { id: r.id, filename: r.filename, uploaded: r.uploaded, variants: r.variants };
}

export async function cfDeleteImage(id: string): Promise<boolean> {
  requireConfig();
  const url = `${CF_API_BASE}/accounts/${config.CLOUDFLARE_ACCOUNT_ID}/images/v1/${id}`;
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}` },
  });
  if (!resp.ok) return false;
  const json: any = await resp.json().catch(() => ({}));
  return !!(json as any).success;
}
