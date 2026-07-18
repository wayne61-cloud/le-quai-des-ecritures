"use client";

import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowDown, Check, CircleDot, Download, Keyboard, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/lib/cv-data";
import { scrollState } from "@/lib/scroll-state";
import { FloatingPanel } from "./FloatingPanel";
import type { ZoneDefinition, ZoneId } from "./types";

const Scene3D = lazy(() => import("./Scene3D").then((module) => ({ default: module.Scene3D })));

const ZONES: ZoneDefinition[] = [
  {
    id: "intro",
    label: "Commencer",
    navLabel: "Intro",
    hint: "Bienvenue",
    center: 0.02,
    x: "50%",
    y: "72%",
  },
  {
    id: "about",
    label: "À propos — Clique ici",
    navLabel: "À propos",
    hint: "Le bar-kiosque",
    center: 0.16,
    x: "34%",
    y: "52%",
  },
  {
    id: "cursus",
    label: "Voir mon cursus",
    navLabel: "Cursus",
    hint: "Gravir les marches",
    center: 0.32,
    x: "58%",
    y: "48%",
  },
  {
    id: "skills",
    label: "Découvrir mes compétences",
    navLabel: "Compétences",
    hint: "Le terrain",
    center: 0.48,
    x: "70%",
    y: "62%",
  },
  {
    id: "experiences",
    label: "Explorer mes expériences",
    navLabel: "Expériences",
    hint: "Le ponton",
    center: 0.64,
    x: "50%",
    y: "58%",
  },
  {
    id: "project",
    label: "Voir mon projet",
    navLabel: "Projet",
    hint: "Cap sur l'horizon",
    center: 0.8,
    x: "58%",
    y: "42%",
  },
  {
    id: "contact",
    label: "Me contacter",
    navLabel: "Contact",
    hint: "Carte de visite",
    center: 0.94,
    x: "50%",
    y: "62%",
  },
];

const MAP_HOTSPOT_ZONE_IDS = new Set<ZoneId>([
  "about",
  "cursus",
  "skills",
  "experiences",
  "project",
  "contact",
]);

const MAP_HOTSPOT_ZONES = ZONES.filter((zone) => MAP_HOTSPOT_ZONE_IDS.has(zone.id));
const SECTION_ORDER: ZoneId[] = [
  "intro",
  "about",
  "cursus",
  "skills",
  "experiences",
  "project",
  "contact",
];
const AUTO_PANEL_ZONE_IDS = new Set<ZoneId>([
  "about",
  "cursus",
  "skills",
  "experiences",
  "project",
  "contact",
]);
const WELCOME_COPY =
  "Bienvenue sur la plage comptable de Yohann Bouah. Scrollez, utilisez les flèches du clavier et cliquez sur les points dorés pour explorer mon parcours, mes compétences, mes expériences et mon projet professionnel.";
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const QUAI_MODEL_PRELOAD = publicAsset("models/quai/scene-optimized.glb");

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function getActiveIndex(progress: number) {
  return ZONES.reduce((best, zone, index) => {
    return Math.abs(progress - zone.center) < Math.abs(progress - ZONES[best].center)
      ? index
      : best;
  }, 0);
}

export function Portfolio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetProgressRef = useRef(0);
  const progressRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const keyThrottleRef = useRef(0);
  const panelOpenTimerRef = useRef<number | null>(null);
  const focusReleaseTimerRef = useRef<number | null>(null);
  const previousAutoSectionRef = useRef<ZoneId>("intro");
  const suppressedPanelZoneRef = useRef<ZoneId | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<ZoneId>("intro");
  const [openZone, setOpenZone] = useState<ZoneId | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const goToProgress = useCallback((value: number) => {
    targetProgressRef.current = clamp(value);
  }, []);

  const updateHash = useCallback((sectionId: ZoneId) => {
    if (typeof window === "undefined") return;
    const nextHash = `#${sectionId}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  }, []);

  const beginCameraFocus = useCallback((sectionId: ZoneId) => {
    if (panelOpenTimerRef.current) window.clearTimeout(panelOpenTimerRef.current);
    if (focusReleaseTimerRef.current) window.clearTimeout(focusReleaseTimerRef.current);

    scrollState.focusZone = sectionId;
    scrollState.focusStartedAt = performance.now();
    focusReleaseTimerRef.current = window.setTimeout(() => {
      if (scrollState.focusZone === sectionId) scrollState.focusZone = null;
      focusReleaseTimerRef.current = null;
    }, 850);
  }, []);

  const goToSection = useCallback(
    (sectionId: ZoneId, options: { updateHash?: boolean; focusCamera?: boolean } = {}) => {
      const zone = ZONES.find((item) => item.id === sectionId);
      if (!zone) return;
      goToProgress(zone.center);
      setActiveSection(sectionId);
      suppressedPanelZoneRef.current = null;
      setShowTutorial(false);
      if (options.focusCamera) beginCameraFocus(sectionId);

      if (options.updateHash !== false) updateHash(sectionId);
    },
    [beginCameraFocus, goToProgress, updateHash],
  );

  const openSection = useCallback(
    (sectionId: ZoneId) => {
      const zone = ZONES.find((item) => item.id === sectionId);
      if (!zone) return;

      if (panelOpenTimerRef.current) window.clearTimeout(panelOpenTimerRef.current);
      suppressedPanelZoneRef.current = null;
      setOpenZone(null);
      setActiveSection(sectionId);
      setShowTutorial(false);
      goToProgress(zone.center);
      progressRef.current = zone.center;
      scrollState.progress = zone.center;
      scrollState.section = ZONES.findIndex((item) => item.id === sectionId);
      setProgress(zone.center);
      beginCameraFocus(sectionId);
      updateHash(sectionId);

      panelOpenTimerRef.current = window.setTimeout(() => {
        setOpenZone(sectionId);
        panelOpenTimerRef.current = null;
      }, 120);
    },
    [beginCameraFocus, goToProgress, updateHash],
  );

  const nudgeProgress = useCallback((delta: number) => {
    scrollState.focusZone = null;
    suppressedPanelZoneRef.current = null;
    targetProgressRef.current = clamp(targetProgressRef.current + delta);
    setShowTutorial(false);
  }, []);

  useEffect(() => {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "fetch";
    preloadLink.href = QUAI_MODEL_PRELOAD;
    preloadLink.crossOrigin = "anonymous";
    document.head.appendChild(preloadLink);

    const hash = window.location.hash.replace("#", "") as ZoneId;
    if (SECTION_ORDER.includes(hash)) {
      goToSection(hash, { updateHash: false, focusCamera: true });
    }

    const onHashChange = () => {
      const nextHash = window.location.hash.replace("#", "") as ZoneId;
      if (SECTION_ORDER.includes(nextHash)) {
        goToSection(nextHash, { updateHash: false, focusCamera: true });
      }
    };

    const closeTutorial = window.setTimeout(() => setShowTutorial(false), 8500);
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.clearTimeout(closeTutorial);
      if (panelOpenTimerRef.current) window.clearTimeout(panelOpenTimerRef.current);
      if (focusReleaseTimerRef.current) window.clearTimeout(focusReleaseTimerRef.current);
      scrollState.focusZone = null;
      window.removeEventListener("hashchange", onHashChange);
      preloadLink.remove();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [goToSection]);

  useEffect(() => {
    let frame = 0;
    let lastUiProgress = -1;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const delta = Math.min(0.08, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const damping = 1 - Math.exp(-5.6 * delta);
      const next = current + (target - current) * damping;
      progressRef.current = Math.abs(target - next) < 0.0004 ? target : next;
      scrollState.progress = progressRef.current;
      scrollState.section = getActiveIndex(progressRef.current);

      if (Math.abs(progressRef.current - lastUiProgress) > 0.002) {
        lastUiProgress = progressRef.current;
        setProgress(progressRef.current);
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const isPanelEvent = (event: Event) => {
      return (
        event.target instanceof Element && Boolean(event.target.closest("[data-floating-panel]"))
      );
    };

    const onWheel = (event: WheelEvent) => {
      if (isPanelEvent(event)) return;
      event.preventDefault();
      const delta = Math.max(-140, Math.min(140, event.deltaY));
      nudgeProgress(delta * 0.00068);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (isPanelEvent(event)) return;
      const y = event.touches[0]?.clientY;
      if (y === undefined || touchYRef.current === null) return;
      event.preventDefault();
      const delta = touchYRef.current - y;
      touchYRef.current = y;
      nudgeProgress(delta * 0.00135);
    };

    const onTouchEnd = () => {
      touchYRef.current = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isTyping && event.key !== "Escape") return;

      if (event.key === "Escape" || event.key === "Esc") {
        if (openZone) {
          event.preventDefault();
          suppressedPanelZoneRef.current = openZone;
          setOpenZone(null);
        }
        return;
      }

      const now = performance.now();
      if (now - keyThrottleRef.current < 350) {
        event.preventDefault();
        return;
      }

      const currentIdx = getActiveIndex(targetProgressRef.current);
      const activeZone = ZONES[currentIdx];
      const keysNext = ["ArrowRight", "ArrowDown", "PageDown", " ", "Spacebar"];
      const keysPrev = ["ArrowLeft", "ArrowUp", "PageUp"];

      if (keysNext.includes(event.key)) {
        event.preventDefault();
        keyThrottleRef.current = now;
        goToSection(SECTION_ORDER[Math.min(SECTION_ORDER.length - 1, currentIdx + 1)], {
          focusCamera: true,
        });
      }

      if (keysPrev.includes(event.key)) {
        event.preventDefault();
        keyThrottleRef.current = now;
        goToSection(SECTION_ORDER[Math.max(0, currentIdx - 1)], { focusCamera: true });
      }

      if (event.key === "Home") {
        event.preventDefault();
        keyThrottleRef.current = now;
        goToSection("intro", { focusCamera: true });
      }

      if (event.key === "End") {
        event.preventDefault();
        keyThrottleRef.current = now;
        goToSection("contact", { focusCamera: true });
      }

      if (event.key === "Enter") {
        event.preventDefault();
        keyThrottleRef.current = now;
        openSection(activeZone.id);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [goToSection, nudgeProgress, openSection, openZone]);

  const progressActiveIdx = getActiveIndex(progress);
  const progressActiveZone = ZONES[progressActiveIdx];

  useEffect(() => {
    if (scrollState.focusZone) return;
    if (progressActiveZone.id === activeSection) return;
    setActiveSection(progressActiveZone.id);
  }, [activeSection, progressActiveZone.id]);

  useEffect(() => {
    if (activeSection === previousAutoSectionRef.current) return;
    previousAutoSectionRef.current = activeSection;

    if (panelOpenTimerRef.current) window.clearTimeout(panelOpenTimerRef.current);

    if (!AUTO_PANEL_ZONE_IDS.has(activeSection)) {
      setOpenZone(null);
      return;
    }

    if (suppressedPanelZoneRef.current === activeSection) return;
    beginCameraFocus(activeSection);
    updateHash(activeSection);
    setOpenZone(null);

    panelOpenTimerRef.current = window.setTimeout(() => {
      setOpenZone(activeSection);
      panelOpenTimerRef.current = null;
    }, 150);
  }, [activeSection, beginCameraFocus, updateHash]);

  const activeIdx = Math.max(
    0,
    ZONES.findIndex((zone) => zone.id === activeSection),
  );
  const activeZone = ZONES[activeIdx];

  return (
    <div
      ref={containerRef}
      className="relative h-screen touch-none overflow-hidden bg-[#07111b] text-foreground"
    >
      <div className="absolute inset-0 z-0">
        <ClientOnly fallback={<CanvasFallback />}>
          <Suspense fallback={<CanvasFallback />}>
            <Scene3D
              zones={MAP_HOTSPOT_ZONES}
              activeZone={activeZone.id}
              openZone={openZone}
              onOpen={openSection}
            />
          </Suspense>
        </ClientOnly>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.42), transparent 62%), radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.16), transparent 58%)",
          }}
        />
      </div>

      <TopNav zones={ZONES} activeIdx={activeIdx} onNavigate={goToSection} />
      <IntroHero progress={progress} />
      <IntroTutorial
        visible={showTutorial && progress < 0.18}
        onDismiss={() => setShowTutorial(false)}
      />
      <FloatingPanel zone={openZone} onClose={() => setOpenZone(null)} />

      <ProgressRail zones={ZONES} activeIdx={activeIdx} />
      <ZoneCaption zones={ZONES} activeIdx={activeIdx} progress={progress} />
      <ScrollHint progress={progress} />
    </div>
  );
}

function CanvasFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#07111b]">
      <div className="text-center">
        <div className="mx-auto h-1 w-16 animate-shimmer rounded-full bg-brass/60" />
        <p className="mt-4 font-hand text-brass">Le quai s'éveille...</p>
      </div>
    </div>
  );
}

function TopNav({
  zones,
  activeIdx,
  onNavigate,
}: {
  zones: ZoneDefinition[];
  activeIdx: number;
  onNavigate: (zone: ZoneId) => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
        <div className="coastal-top-brand">
          <p className="font-display text-lg tracking-wide text-[#fff7e8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            Le Quai des Écritures
          </p>
          <p className="-mt-1 font-hand text-xs text-[#f1c66d] drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
            Yohann-Axel Bouah
          </p>
        </div>
        <nav className="coastal-top-menu hidden items-center gap-5 px-3 py-2 text-[11px] uppercase tracking-widest lg:flex">
          {zones.slice(1).map((zone) => (
            <a
              key={zone.id}
              href={`#${zone.id}`}
              className={`transition ${
                zones[activeIdx].id === zone.id ? "text-[#d7a93f]" : "hover:text-[#f1c66d]"
              }`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(zone.id);
              }}
            >
              {zone.navLabel}
            </a>
          ))}
        </nav>
        <a href={profile.cvUrl} download>
          <Button className="h-9 rounded-sm border border-[#d6b36a]/75 bg-[#07111b]/60 px-3 text-xs font-semibold tracking-wide text-[#fff7e8] shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-[#07111b]/78 hover:text-[#f1c66d]">
            <Download className="mr-2 h-3.5 w-3.5" />
            CV
          </Button>
        </a>
      </div>
    </header>
  );
}

function IntroHero({ progress }: { progress: number }) {
  return (
    <AnimatePresence>
      {progress < 0.14 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45 }}
          className="pointer-events-none fixed inset-x-0 top-24 z-20 mx-auto max-w-3xl px-4 text-center md:top-28 md:px-5"
        >
          <p className="font-hand text-lg text-[#f1c66d] drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)] md:text-2xl">
            Bienvenue
          </p>
          <h1 className="mt-1 font-display text-2xl leading-tight text-[#fff7e8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-3xl md:text-5xl">
            Le Quai des Écritures
          </h1>
          <p className="coastal-hero-copy mx-auto mt-2 max-w-2xl px-3 py-2.5 text-xs leading-relaxed sm:text-sm md:mt-3 md:px-4 md:py-3 md:text-base">
            {WELCOME_COPY}
          </p>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function IntroTutorial({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const actions = [
    { icon: Mouse, title: "Molette / scroll", detail: "avancer" },
    { icon: Keyboard, title: "Flèches ← →", detail: "naviguer" },
    { icon: CircleDot, title: "Repères dorés", detail: "fiche auto" },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          className="coastal-tutorial fixed bottom-24 left-4 z-40 w-[min(92vw,360px)] p-3.5 text-paper md:bottom-8 md:left-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg text-paper">Comment explorer</p>
              <div className="mt-2 space-y-1 text-xs leading-relaxed text-paper/78">
                <p>Explorez la plage comptable de Yohann Bouah.</p>
                <p>Faites défiler, utilisez les flèches ou laissez-vous guider.</p>
                <p>À l’approche de chaque repère, les fiches apparaissent automatiquement.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-sm border border-brass/35 bg-brass/10 px-2.5 py-1.5 text-xs text-brass transition hover:bg-brass/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              <Check className="mr-1 inline h-3.5 w-3.5" />
              J’ai compris
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.title} className="coastal-tutorial-card p-2">
                  <Icon className="h-4 w-4 text-brass" />
                  <p className="mt-1.5 text-[10px] uppercase tracking-widest text-paper/70">
                    {action.title}
                  </p>
                  <p className="text-sm text-paper">{action.detail}</p>
                </div>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ZoneCaption({
  zones,
  activeIdx,
  progress,
}: {
  zones: ZoneDefinition[];
  activeIdx: number;
  progress: number;
}) {
  const zone = zones[activeIdx];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-11 z-20 flex justify-center px-4 md:bottom-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="section-plaque text-center"
        >
          <p className="section-plaque-kicker">{zone.hint}</p>
          <p className="section-plaque-title">{zone.navLabel}</p>
          <p className="section-plaque-meta">
            {activeIdx + 1} / {zones.length} - {Math.round(progress * 100)}%
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ScrollHint({ progress }: { progress: number }) {
  const opacity = progress < 0.08 ? 1 : 0;
  return (
    <motion.div
      animate={{ opacity }}
      transition={{ duration: 0.25 }}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center"
    >
      <div className="flex flex-col items-center gap-1 text-white/70">
        <p className="text-[10px] uppercase tracking-[0.35em]">Défilez pour explorer</p>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowDown className="h-4 w-4 text-brass" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProgressRail({ zones, activeIdx }: { zones: ZoneDefinition[]; activeIdx: number }) {
  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="flex flex-col items-end gap-3">
        {zones.map((zone, index) => (
          <div
            key={zone.id}
            className={`flex items-center gap-3 transition-all ${
              index === activeIdx ? "opacity-100" : "opacity-40"
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-widest ${
                index === activeIdx ? "text-[#d7a93f]" : "text-[rgba(255,248,230,0.55)]"
              }`}
            >
              {zone.navLabel}
            </span>
            <span
              className={`h-px transition-all ${
                index === activeIdx ? "w-8 bg-[#d7a93f]" : "w-3 bg-[rgba(255,248,230,0.38)]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
