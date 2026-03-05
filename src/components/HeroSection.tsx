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
const FRAME_EASE = 0.18;

const getFrameSrc = (frame: number) => `/images/transformer-sequence/${frame}.jpg`;

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const preloadedFramesRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [useDarkText, setUseDarkText] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Match progress exactly to sticky lifetime so next section starts only after full hero timeline.
    offset: ["start start", "end end"],
  });

  // Load frame 1 immediately, then progressively preload the rest in small chunks.
  useEffect(() => {
    let frame = 1;
    let cancelled = false;

    const preloadChunk = () => {
      if (cancelled || frame > HERO_SEQUENCE_FRAMES) return;

      for (let i = 0; i < 12 && frame <= HERO_SEQUENCE_FRAMES; i += 1) {
        if (!preloadedFramesRef.current.has(frame)) {
          const img = new Image();
          img.decoding = "async";
          img.src = getFrameSrc(frame);
          preloadedFramesRef.current.add(frame);
        }
        frame += 1;
      }

      window.setTimeout(preloadChunk, 16);
    };

    preloadChunk();
    return () => {
      cancelled = true;
    };
  }, []);

  const animateToTargetFrame = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const tick = () => {
      const target = targetProgressRef.current;
      const current = smoothProgressRef.current;
      const delta = target - current;
      const nextProgress = Math.abs(delta) < 0.0005 ? target : current + delta * FRAME_EASE;
      smoothProgressRef.current = nextProgress;

      const nextFrame = Math.min(
        HERO_SEQUENCE_FRAMES,
        Math.max(1, Math.round(nextProgress * (HERO_SEQUENCE_FRAMES - 1)) + 1)
      );

      setCurrentFrame((prev) => (prev === nextFrame ? prev : nextFrame));

      const shouldUseDarkText = nextFrame > DARK_TEXT_AFTER_FRAME;
      setUseDarkText((prev) => (prev === shouldUseDarkText ? prev : shouldUseDarkText));

      if (Math.abs(targetProgressRef.current - smoothProgressRef.current) < 0.0005) {
        isAnimatingRef.current = false;
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

  const bgYRaw = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const bgScaleRaw = useTransform(scrollYProgress, [0, 1], [1.16, 1.05]);
  const textYRaw = useTransform(scrollYProgress, [0, 1], [0, -34]);

  const spring = { stiffness: 70, damping: 28, mass: 1 };
  const bgY = useSpring(bgYRaw, spring);
  const bgScale = useSpring(bgScaleRaw, spring);
  const textY = useSpring(textYRaw, spring);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${HERO_SCROLL_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
          <img
            src={getFrameSrc(currentFrame)}
            alt="Bouquet hero"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
