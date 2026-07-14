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

type PlayerContextValue = {
  queue: PlayableSong[];
  currentSong: PlayableSong | null;
  isPlaying: boolean;
  progress: number; // secondes
  isFullPlayerOpen: boolean;
  playQueue: (songs: PlayableSong[], startIndex?: number) => void;
  enqueue: (song: PlayableSong) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setBandGain: (index: number, gainDb: number) => void;
  applyPreset: (gains: number[]) => void;
  setBassBoost: (percent: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

const PLAY_RECORD_THRESHOLD_SECONDS = 30;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { audioRef, ensureAudioGraph, setBandGain, applyPreset, setBassBoost } = useAudioEngine();
  const [queue, setQueue] = useState<PlayableSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const hasRecordedPlay = useRef(false);

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
  }, [queue, currentIndex]);

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
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }

  function enqueue(song: PlayableSong) {
    if (queue.length === 0) {
      playQueue([song], 0);
      return;
    }
    setQueue((prev) => [...prev, song]);
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
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function playPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  }

  function seek(seconds: number) {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setProgress(seconds);
  }

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentSong,
        isPlaying,
        progress,
        isFullPlayerOpen,
        playQueue,
        enqueue,
        togglePlay,
        playNext,
        playPrevious,
        seek,
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
