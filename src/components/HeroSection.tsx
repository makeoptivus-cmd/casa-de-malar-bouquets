import { useRef, useState } from "react";
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

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [frameIndex, setFrameIndex] = useState(1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Match progress exactly to sticky lifetime so next section starts only after full hero timeline.
    offset: ["start start", "end end"],
  });

  // Tie scroll progress to sequence frame so the hero visibly reacts while scrolling.
  useMotionValueEvent(scrollYProgress, "change", (latestProgress) => {
    const nextFrame = Math.min(
      HERO_SEQUENCE_FRAMES,
      Math.max(1, Math.round(latestProgress * (HERO_SEQUENCE_FRAMES - 1)) + 1)
    );
    setFrameIndex((previousFrame) => (previousFrame === nextFrame ? previousFrame : nextFrame));
  });

  const bgYRaw = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const bgScaleRaw = useTransform(scrollYProgress, [0, 1], [1.16, 1.05]);
  const textYRaw = useTransform(scrollYProgress, [0, 1], [0, -34]);

  const spring = { stiffness: 90, damping: 30, mass: 0.9 };
  const bgY = useSpring(bgYRaw, spring);
  const bgScale = useSpring(bgScaleRaw, spring);
  const textY = useSpring(textYRaw, spring);
  const useDarkText = frameIndex > 195;

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${HERO_SCROLL_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
          <img
            src={`/images/transformer-sequence/${frameIndex}.jpg`}
            alt="Bouquet hero"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
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
