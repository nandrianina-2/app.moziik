"use client";

import { useEffect, useRef } from "react";
import {
  EQ_BANDS,
  BASS_BOOST_FREQUENCY,
  BASS_BOOST_MAX_DB,
  MAKEUP_GAIN_MAX,
} from "@/components/player/constants/eq";

/**
 * Encapsule un <audio> et une chaîne Web Audio API pour appliquer un
 * véritable égaliseur 10 bandes + un Bass Boost dédié (façon Poweramp),
 * plutôt qu'un simple visuel décoratif.
 *
 * Chaîne du signal :
 * source -> [10 filtres peaking] -> low-shelf (bass boost) -> gain de
 * compensation (loudness) -> destination
 */
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const bassBoostRef = useRef<BiquadFilterNode | null>(null);
  const makeupGainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }
  }, []);

  /** Doit être appelé après une interaction utilisateur (politique autoplay des navigateurs). */
  function ensureAudioGraph() {
    if (!audioRef.current || audioContextRef.current) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audioRef.current);

    const filters = EQ_BANDS.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = band.frequency;
      filter.Q.value = 1.1;
      filter.gain.value = 0;
      return filter;
    });

    const bassBoost = ctx.createBiquadFilter();
    bassBoost.type = "lowshelf";
    bassBoost.frequency.value = BASS_BOOST_FREQUENCY;
    bassBoost.gain.value = 0;

    const makeupGain = ctx.createGain();
    makeupGain.gain.value = 1;

    // source -> filtre 1 -> ... -> filtre 10 -> bassBoost -> makeupGain -> destination
    let node: AudioNode = source;
    filters.forEach((filter) => {
      node.connect(filter);
      node = filter;
    });
    node.connect(bassBoost);
    bassBoost.connect(makeupGain);
    makeupGain.connect(ctx.destination);

    audioContextRef.current = ctx;
    filtersRef.current = filters;
    bassBoostRef.current = bassBoost;
    makeupGainRef.current = makeupGain;
    sourceRef.current = source;
  }

  function setBandGain(index: number, gainDb: number) {
    if (filtersRef.current[index]) {
      filtersRef.current[index].gain.value = gainDb;
    }
  }

  function applyPreset(gains: number[]) {
    gains.forEach((g, i) => setBandGain(i, g));
  }

  /** percent : 0-100, comme le slider Bass Boost de Poweramp. */
  function setBassBoost(percent: number) {
    const ratio = Math.min(Math.max(percent, 0), 100) / 100;
    if (bassBoostRef.current) {
      bassBoostRef.current.gain.value = ratio * BASS_BOOST_MAX_DB;
    }
    if (makeupGainRef.current) {
      // Compense légèrement le volume perçu quand le boost est fort,
      // pour un son plus puissant sans écrêter.
      makeupGainRef.current.gain.value = 1 + ratio * (MAKEUP_GAIN_MAX - 1);
    }
  }

  return { audioRef, ensureAudioGraph, setBandGain, applyPreset, setBassBoost };
}
