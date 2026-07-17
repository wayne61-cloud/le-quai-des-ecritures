"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ZoneDefinition, ZoneId } from "./types";

export function Hotspots({
  zones,
  activeIdx,
  openZone,
  onOpen,
}: {
  zones: ZoneDefinition[];
  activeIdx: number;
  openZone: ZoneId | null;
  onOpen: (id: ZoneId) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {zones.map((zone, index) => {
        const active = index === activeIdx && openZone !== zone.id;
        return (
          <AnimatePresence key={zone.id}>
            {active && (
              <motion.button
                initial={{ opacity: 0, scale: 0.86, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.86, y: -6 }}
                transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
                onClick={() => onOpen(zone.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(zone.id);
                  }
                }}
                className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: zone.x, top: zone.y }}
                aria-label={zone.label}
              >
                <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/18 blur-lg motion-safe:animate-pulse" />
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-brass/70 bg-[#07111b]/55 shadow-[0_0_24px_rgba(214,179,106,0.18)] backdrop-blur-md transition group-hover:scale-110 group-hover:border-brass group-hover:bg-[#07111b]/75 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-brass">
                  <span className="h-2 w-2 rounded-full bg-[#d6b36a] shadow-[0_0_14px_rgba(214,179,106,0.9)]" />
                  <span className="absolute -bottom-2 h-4 w-px bg-brass/60" />
                </span>
                <span className="absolute left-1/2 top-full mt-3 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-sm border border-brass/35 bg-[#07111b]/58 px-2.5 py-1 font-hand text-sm text-paper shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md transition group-hover:border-brass/70 group-hover:bg-[#07111b]/82 group-focus-visible:bg-[#07111b]/82">
                  {zone.label}
                  <ChevronDown className="h-3 w-3 text-brass motion-safe:animate-bounce" />
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}
