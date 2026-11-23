export const convexOrigin = import.meta.env.CONVEX_ORIGIN ?? '';
import type { Answer, Storage } from './app.contract.d.ts';
const DIR = 'app:/data/journal';
const FILE = `${DIR}/entries.json`;
export const grants = `device.geolocation purpose.geolocation\ndevice.camera purpose.camera\nfs.read app:/data\nfs.write app:/data`;
type Entry = { id: string; note: string; lat: number; lon: number; photo: string };
async function read(storage: Storage): Promise<Entry[]> {
  try { return JSON.parse(new TextDecoder().decode(await storage.fs.readFile(FILE))); }
  catch (e: any) { if (e.code === 'ENOENT' || e.code === 'bake') return []; throw e; }
}
const sources: Record<string, (...args: any[]) => Promise<unknown>> = {
  entries: async (_args, _store, storage) => ({ entries: await read(storage) }),
  saveEntry: async ([note, lat, lon, photo], _store, storage) => {
    const entries = await read(storage);
    await storage.fs.mkdir(DIR);
    await storage.fs.writeFile(FILE, new TextEncoder().encode(JSON.stringify([{ id: `${entries.length + 1}`, note, lat, lon, photo }, ...entries])));
    return { ok: true };
  },
};
export const answer = ((source: string, args: unknown, store: unknown, storage: Storage) => sources[source](args, store, storage)) as unknown as Answer;
