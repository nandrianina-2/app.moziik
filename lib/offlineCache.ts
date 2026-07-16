"use client";

// Stocke les fichiers audio/pochette dans le Cache Storage du
// navigateur (lu ensuite par le service worker, même hors-ligne) et
// garde un index léger en localStorage pour afficher la liste des
// sons téléchargés dans /bibliotheque — sans dépendre du réseau.

const OFFLINE_MEDIA_CACHE = "moziik-offline-media";
const INDEX_KEY = "moziik-offline-index";

export type OfflineSongMeta = {
  _id: string;
  title: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  artist: { _id: string; stageName: string; verified?: boolean };
};

function readIndex(): OfflineSongMeta[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeIndex(items: OfflineSongMeta[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("moziik-offline-change"));
}

export function listOfflineSongs(): OfflineSongMeta[] {
  return readIndex();
}

export function isSongOffline(songId: string): boolean {
  return readIndex().some((s) => s._id === songId);
}

export async function downloadSongForOffline(song: OfflineSongMeta): Promise<void> {
  if (!("caches" in window)) throw new Error("Le mode hors-ligne n'est pas supporté par ce navigateur.");

  const cache = await caches.open(OFFLINE_MEDIA_CACHE);
  await Promise.all([cache.add(song.audioUrl), cache.add(song.coverUrl)]);

  const index = readIndex();
  if (!index.some((s) => s._id === song._id)) {
    writeIndex([...index, song]);
  }
}

export async function removeOfflineSong(songId: string): Promise<void> {
  const index = readIndex();
  const song = index.find((s) => s._id === songId);
  if (!song) return;

  const cache = await caches.open(OFFLINE_MEDIA_CACHE);
  await cache.delete(song.audioUrl);
  await cache.delete(song.coverUrl);

  writeIndex(index.filter((s) => s._id !== songId));
}
