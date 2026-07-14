"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { EQ_BANDS, EQ_PRESETS } from "@/components/player/constants/eq";
import { usePlayer } from "@/context/PlayerProvider";

export function EQPanel() {
  const { setBandGain, applyPreset, setBassBoost } = usePlayer();
  const [gains, setGains] = useState<number[]>(EQ_BANDS.map(() => 0));
  const [activePreset, setActivePreset] = useState("Plat");
  const [bassBoost, setBassBoostValue] = useState(0);

  function handleSlider(index: number, value: number) {
    const next = [...gains];
    next[index] = value;
    setGains(next);
    setBandGain(index, value);
    setActivePreset("");
  }

  function handlePreset(name: string) {
    setActivePreset(name);
    setGains(EQ_PRESETS[name]);
    applyPreset(EQ_PRESETS[name]);
  }

  function handleBassBoost(value: number) {
    setBassBoostValue(value);
    setBassBoost(value);
  }

  return (
    <div>
      {/* Bass Boost — mis en avant comme dans Poweramp */}
      <div className="rounded-xl2 border border-border bg-base px-4 py-3.5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Flame size={15} className="text-accent" />
            Bass Boost
          </span>
          <span className="text-xs text-ink-muted">{bassBoost}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={bassBoost}
          onChange={(e) => handleBassBoost(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
          aria-label="Bass boost"
        />
        <p className="text-[11px] text-ink-muted mt-1">
          Renforce les basses et compense le volume pour un son plus puissant.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(EQ_PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => handlePreset(name)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              activePreset === name
                ? "bg-accent text-base border-accent"
                : "border-border text-ink-muted hover:border-accent"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-between gap-1.5 h-40 overflow-x-auto pb-1">
        {EQ_BANDS.map((band, i) => (
          <div key={band.id} className="flex flex-col items-center gap-2 flex-1 min-w-[24px]">
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={gains[i]}
              onChange={(e) => handleSlider(i, Number(e.target.value))}
              className="eq-slider accent-accent"
              style={{ writingMode: "vertical-lr" as const, direction: "rtl", height: "100%" }}
              aria-label={`Gain ${band.label} Hz`}
            />
            <span className="text-[9px] text-ink-muted">{band.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
