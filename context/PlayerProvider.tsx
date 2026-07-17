"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAudioEngine } from "@/components/player/hooks/useAudioEngine";

export type PlayableSong = {
  _id: string;
  title: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  artist: { _id: string; stageName: string; verified?: boolean };
  featuring?: { artist: { _id: string; stageName: string; verified?: boolean }; confirmed: boolean }[];
  album?: { _id: string; title: string } | string;
  genre?: string;
  releaseDate?: string;
  likesCount?: number;
};

export type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  queue: PlayableSong[];
  currentSong: PlayableSong | null;
  isPlaying: boolean;
  progress: number; // secondes
  isFullPlayerOpen: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  playQueue: (songs: PlayableSong[], startIndex?: number) => void;
  enqueue: (song: PlayableSong) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setBandGain: (index: number, gainDb: number) => void;
  applyPreset: (gains: number[]) => void;
  setBassBoost: (percent: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

const PLAY_RECORD_THRESHOLD_SECONDS = 30;

// Mélange de Fisher-Yates, en gardant `keepFirst` (l'index en cours de
// lecture) en toute première position pour ne pas couper la piste actuelle.
function shuffledOrder(length: number, keepFirst: number): number[] {
  const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== keepFirst);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [keepFirst, ...rest];
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { audioRef, ensureAudioGraph, setBandGain, applyPreset, setBassBoost } = useAudioEngine();
  const [queue, setQueue] = useState<PlayableSong[]>([]);
  // `order` est une permutation des index de `queue` représentant l'ordre de
  // lecture réel (identité quand la lecture aléatoire est désactivée).
  // `position` pointe la place courante à l'intérieur de cet ordre.
  const [order, setOrder] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const hasRecordedPlay = useRef(false);

  const currentIndex = order[position] ?? 0;
  const currentSong = queue[currentIndex] ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onEnded = () => playNext();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, order, position, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.audioUrl;
    hasRecordedPlay.current = false;
    if (isPlaying) audio.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  useEffect(() => {
    if (progress >= PLAY_RECORD_THRESHOLD_SECONDS && !hasRecordedPlay.current && currentSong) {
      hasRecordedPlay.current = true;
      fetch(`/api/songs/${currentSong._id}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secondsListened: progress, completed: true, device: "web" }),
      }).catch(() => {});
    }
  }, [progress, currentSong]);

  function playQueue(songs: PlayableSong[], startIndex = 0) {
    ensureAudioGraph();
    setQueue(songs);
    const initialOrder = isShuffled ? shuffledOrder(songs.length, startIndex) : songs.map((_, i) => i);
    setOrder(initialOrder);
    setPosition(initialOrder.indexOf(startIndex));
    setIsPlaying(true);
  }

  function enqueue(song: PlayableSong) {
    if (queue.length === 0) {
      playQueue([song], 0);
      return;
    }
    setQueue((prev) => [...prev, song]);
    setOrder((prev) => [...prev, queue.length]);
  }

  function togglePlay() {
    ensureAudioGraph();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  function playNext() {
    const audio = audioRef.current;
    if (repeatMode === "one" && audio) {
      audio.currentTime = 0;
      setProgress(0);
      audio.play();
      setIsPlaying(true);
      return;
    }
    if (position < order.length - 1) {
      setPosition(position + 1);
      setIsPlaying(true);
    } else if (repeatMode === "all" && order.length > 0) {
      setPosition(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function playPrevious() {
    // Comme sur la plupart des lecteurs : si on a déjà avancé dans le
    // morceau, "précédent" revient d'abord au début de celui-ci.
    if (progress > 3) {
      seek(0);
      return;
    }
    if (position > 0) {
      setPosition(position - 1);
      setIsPlaying(true);
    } else if (repeatMode === "all" && order.length > 0) {
      setPosition(order.length - 1);
      setIsPlaying(true);
    }
  }

  function seek(seconds: number) {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setProgress(seconds);
  }

  function toggleShuffle() {
    if (!isShuffled) {
      setOrder(shuffledOrder(queue.length, currentIndex));
      setPosition(0);
    } else {
      setOrder(queue.map((_, i) => i));
      setPosition(currentIndex);
    }
    setIsShuffled(!isShuffled);
  }

  function cycleRepeatMode() {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  }

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentSong,
        isPlaying,
        progress,
        isFullPlayerOpen,
        isShuffled,
        repeatMode,
        playQueue,
        enqueue,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        toggleShuffle,
        cycleRepeatMode,
        setBandGain,
        applyPreset,
        setBassBoost,
        openFullPlayer: () => setFullPlayerOpen(true),
        closeFullPlayer: () => setFullPlayerOpen(false),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer doit être utilisé sous PlayerProvider.");
  return ctx;
}
