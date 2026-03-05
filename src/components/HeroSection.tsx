import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

// Balanced scroll track so the whole sequence plays in about two swipes.
const HERO_SCROLL_VH = 200;
const HERO_SEQUENCE_FRAMES = 226;
const DARK_TEXT_AFTER_FRAME = 195;
const FRAME_EASE = 0.28;
const BASE_MAX_FRAME_STEP_PER_TICK = 3.8;
const POST_SECTION_MAX_FRAME_STEP_PER_TICK = 7.2;
const POST_SECTION_FRAME_START = 170;
const DEFAULT_HEADER_OFFSET = 72;
const PRELOAD_AHEAD = 32;
const PRELOAD_BEHIND = 14;
const INITIAL_BURST_FRAMES = 80;
const PRELOAD_CHUNK_SIZE = 18;
const PRELOAD_CHUNK_DELAY_MS = 10;
const FRAME_LOAD_MAX_RETRIES = 2;
const FRAME_GAP_SEARCH_RADIUS = 12;
const PARALLAX_SPRING = { stiffness: 42, damping: 26, mass: 1.15 };

const getFrameSrc = (frame: number) => `/images/transformer-sequence/${frame}.jpg`;

const drawCoverImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  alpha = 1
) => {
  const imageWidth = img.naturalWidth;
  const imageHeight = img.naturalHeight;
  if (!imageWidth || !imageHeight) return;

  const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = (canvasWidth - drawWidth) / 2;
  const drawY = (canvasHeight - drawHeight) / 2;

  ctx.globalAlpha = alpha;
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
};

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>(
    Array(HERO_SEQUENCE_FRAMES + 1).fill(null)
  );
  const inFlightFramesRef = useRef<Set<number>>(new Set());
  const frameLoadRetriesRef = useRef<Map<number, number>>(new Map());
  const loadedFramesRef = useRef<Set<number>>(new Set());
  const maxLoadedFrameRef = useRef(0);
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const lastTickTimeRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const displayedFrameFloatRef = useRef(1);
  const lastRenderedFrameRef = useRef(-1);
  const resizeRafRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [headerOffset, setHeaderOffset] = useState(DEFAULT_HEADER_OFFSET);
  const [useDarkText, setUseDarkText] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Match progress exactly to sticky lifetime so next section starts only after full hero timeline.
    offset: ["start start", "end end"],
  });

  // Keep sticky hero aligned below the fixed navbar across breakpoints.
  useEffect(() => {
    const updateHeaderOffset = () => {
      const nav = document.querySelector("nav");
      const nextOffset = nav instanceof HTMLElement ? nav.offsetHeight : DEFAULT_HEADER_OFFSET;
      setHeaderOffset(nextOffset > 0 ? nextOffset : DEFAULT_HEADER_OFFSET);
    };

    updateHeaderOffset();
    window.addEventListener("resize", updateHeaderOffset);
    return () => window.removeEventListener("resize", updateHeaderOffset);
  }, []);

  const renderFrameFloat = (frameFloat: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxReady = Math.max(1, maxLoadedFrameRef.current);
    const clampedFloat = Math.min(Math.max(1, frameFloat), maxReady);
    const idealLower = Math.floor(clampedFloat);

    let lower = idealLower;
    if (!imagesRef.current[lower]) {
      for (let radius = 1; radius <= FRAME_GAP_SEARCH_RADIUS; radius += 1) {
        const prev = idealLower - radius;
        const next = idealLower + radius;
        if (prev >= 1 && imagesRef.current[prev]) {
          lower = prev;
          break;
        }
        if (next <= maxReady && imagesRef.current[next]) {
          lower = next;
          break;
        }
      }
    }

    let upper = Math.min(maxReady, lower + 1);
    if (!imagesRef.current[upper]) {
      for (let radius = 1; radius <= FRAME_GAP_SEARCH_RADIUS; radius += 1) {
        const probe = upper + radius;
        if (probe <= maxReady && imagesRef.current[probe]) {
          upper = probe;
          break;
        }
      }
    }

    if (!imagesRef.current[upper]) {
      upper = lower;
    }

    const denominator = Math.max(1, upper - lower);
    const mix = upper === lower ? 0 : Math.max(0, Math.min(1, (clampedFloat - lower) / denominator));

    const lowerImage = imagesRef.current[lower];
    const upperImage = imagesRef.current[upper];

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (lowerImage) {
      drawCoverImage(ctx, lowerImage, width, height, upperImage ? 1 - mix : 1);
    }

    if (upperImage && upper !== lower) {
      drawCoverImage(ctx, upperImage, width, height, mix);
    }

    ctx.globalAlpha = 1;
    lastRenderedFrameRef.current = lower;
  };

  const commitLoadedFrame = (frame: number, img: HTMLImageElement) => {
    imagesRef.current[frame] = img;
    loadedFramesRef.current.add(frame);
    inFlightFramesRef.current.delete(frame);
    frameLoadRetriesRef.current.delete(frame);
    maxLoadedFrameRef.current = Math.max(maxLoadedFrameRef.current, frame);

    if (
      frame === lastRenderedFrameRef.current + 1 ||
      frame === lastRenderedFrameRef.current ||
      frame === Math.floor(displayedFrameFloatRef.current)
    ) {
      renderFrameFloat(displayedFrameFloatRef.current);
    }
  };

  const requestFrame = (frame: number) => {
    if (frame < 1 || frame > HERO_SEQUENCE_FRAMES) return;
    if (loadedFramesRef.current.has(frame) || inFlightFramesRef.current.has(frame)) return;

    const img = new Image();
    img.decoding = "async";
    inFlightFramesRef.current.add(frame);

    img.onload = async () => {
      try {
        await img.decode();
      } catch {
        // Some browsers may throw for cached images; onload already guarantees drawable state.
      }
      commitLoadedFrame(frame, img);
    };

    img.onerror = () => {
      inFlightFramesRef.current.delete(frame);

      const retries = frameLoadRetriesRef.current.get(frame) ?? 0;
      if (retries < FRAME_LOAD_MAX_RETRIES) {
        frameLoadRetriesRef.current.set(frame, retries + 1);
        window.setTimeout(() => requestFrame(frame), 30 * (retries + 1));
      }
    };

    img.src = getFrameSrc(frame);
  };

  const preloadAroundTarget = (frameFloat: number) => {
    const center = Math.round(frameFloat);
    requestFrame(center);

    for (let offset = 1; offset <= PRELOAD_AHEAD; offset += 1) {
      requestFrame(center + offset);
    }

    for (let offset = 1; offset <= PRELOAD_BEHIND; offset += 1) {
      requestFrame(center - offset);
    }
  };

  const preloadInitialBurst = () => {
    // Front-load early frames for smooth pre/on scroll experience.
    for (let frame = 1; frame <= Math.min(HERO_SEQUENCE_FRAMES, INITIAL_BURST_FRAMES); frame += 1) {
      requestFrame(frame);
    }
  };

  const resizeCanvasToContainer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const dprCap = isMobile ? 1.25 : 1.75;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      renderFrameFloat(displayedFrameFloatRef.current);
    }
  };

  // Ensure frame 1 appears immediately.
  useEffect(() => {
    preloadInitialBurst();
  }, []);

  // Resize canvas when viewport changes.
  useEffect(() => {
    const onResize = () => {
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
      }
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        resizeCanvasToContainer();
      });
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
      }
    };
  }, [headerOffset]);

  // Load sequence frames progressively in small chunks without blocking scroll.
  useEffect(() => {
    let frame = INITIAL_BURST_FRAMES + 1;
    let cancelled = false;

    const preloadChunk = () => {
      if (cancelled || frame > HERO_SEQUENCE_FRAMES) return;

      for (let i = 0; i < PRELOAD_CHUNK_SIZE && frame <= HERO_SEQUENCE_FRAMES; i += 1) {
        requestFrame(frame);
        frame += 1;
      }

      window.setTimeout(preloadChunk, PRELOAD_CHUNK_DELAY_MS);
    };

    preloadChunk();
    return () => {
      cancelled = true;
    };
  }, []);

  const animateToTargetFrame = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    lastTickTimeRef.current = null;

    const tick = (now: number) => {
      const prevTime = lastTickTimeRef.current;
      const deltaMs = prevTime === null ? 16.67 : Math.min(48, Math.max(8, now - prevTime));
      lastTickTimeRef.current = now;
      const timeScale = deltaMs / 16.67;

      const target = targetProgressRef.current;
      const current = smoothProgressRef.current;
      const currentFrameFloat = current * (HERO_SEQUENCE_FRAMES - 1) + 1;
      const targetFrameFloat = target * (HERO_SEQUENCE_FRAMES - 1) + 1;
      const frameDelta = targetFrameFloat - currentFrameFloat;
      const distanceFrames = Math.abs(frameDelta);

      const adaptiveEase = 1 - Math.pow(1 - FRAME_EASE, timeScale);
      const desiredFrameStep = frameDelta * adaptiveEase;
      const dynamicStepBase =
        targetFrameFloat >= POST_SECTION_FRAME_START
          ? POST_SECTION_MAX_FRAME_STEP_PER_TICK
          : BASE_MAX_FRAME_STEP_PER_TICK;
      const distanceBoost = Math.min(5.2, distanceFrames * 0.2);
      const frameStepCap = (dynamicStepBase + distanceBoost) * timeScale;
      const cappedFrameStep = Math.max(
        -frameStepCap,
        Math.min(frameStepCap, desiredFrameStep)
      );

      const nextFrameFloat =
        Math.abs(frameDelta) < 0.02 ? targetFrameFloat : currentFrameFloat + cappedFrameStep;

      const nextProgress = (nextFrameFloat - 1) / (HERO_SEQUENCE_FRAMES - 1);
      smoothProgressRef.current = Math.min(1, Math.max(0, nextProgress));

      const clampedNextFrameFloat = Math.min(
        HERO_SEQUENCE_FRAMES,
        Math.max(1, nextFrameFloat)
      );

      displayedFrameFloatRef.current = clampedNextFrameFloat;
      preloadAroundTarget(targetFrameFloat);
      renderFrameFloat(clampedNextFrameFloat);

      const shouldUseDarkText = clampedNextFrameFloat > DARK_TEXT_AFTER_FRAME;
      setUseDarkText((prev) => (prev === shouldUseDarkText ? prev : shouldUseDarkText));

      if (Math.abs(targetFrameFloat - clampedNextFrameFloat) < 0.12) {
        isAnimatingRef.current = false;
        lastTickTimeRef.current = null;
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
  };

  // Smoothly converge toward the latest scroll progress to avoid visible frame jumping.
  useMotionValueEvent(scrollYProgress, "change", (latestProgress) => {
    targetProgressRef.current = Math.min(1, Math.max(0, latestProgress));
    animateToTargetFrame();
  });

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Use one smoothed progress source so all parallax layers move together.
  const smoothParallaxProgress = useSpring(scrollYProgress, PARALLAX_SPRING);
  const bgY = useTransform(smoothParallaxProgress, [0, 1], [0, -68]);
  const bgScale = useTransform(smoothParallaxProgress, [0, 1], [1.12, 1.04]);
  const textY = useTransform(smoothParallaxProgress, [0, 1], [0, -24]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `calc(${HERO_SCROLL_VH}vh + ${headerOffset}px)` }}
    >
      <div
        className="sticky overflow-hidden bg-white"
        style={{
          top: `${headerOffset}px`,
          height: `calc(100vh - ${headerOffset}px)`,
        }}
      >
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
            aria-label="Bouquet hero sequence"
          />
        </motion.div>

        <motion.div
          className="relative z-10 h-full flex items-end pb-16 sm:pb-20 md:pb-24"
          style={{ y: textY, opacity: 1 }}
        >
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
            <p className={`text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4 ${useDarkText ? "text-black" : "text-white"}`}>
              Casa De Malar
            </p>
            <h1 className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl ${useDarkText ? "text-black" : "text-white"}`}>
              Not just flowers.
              <br />
              <span className={`italic ${useDarkText ? "text-black" : "text-white"}`}>
                Moments that stay.
              </span>
            </h1>

            <p className={`mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed ${useDarkText ? "text-black" : "text-white"}`}>
              Handcrafted bouquets designed around your story.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className={`px-6 sm:px-8 py-3 rounded-full text-[11px] tracking-[0.16em] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] ${
                  useDarkText
                    ? "bg-black text-white border border-black shadow-[0_10px_26px_rgba(0,0,0,0.25)]"
                    : "bg-white text-black border border-white/80 shadow-[0_10px_26px_rgba(0,0,0,0.35)]"
                }`}
              >
                Tell Us Your Story
              </button>

              <p
                className={`inline-flex items-center gap-2 text-[11px] sm:text-xs tracking-[0.12em] uppercase px-4 py-2 rounded-full border ${
                  useDarkText
                    ? "bg-black/[0.08] text-black border-black/25"
                    : "bg-white/90 text-black border-white/80"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-black" aria-hidden="true" />
                Delivery available
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
