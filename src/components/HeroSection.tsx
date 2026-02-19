import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { Truck } from "lucide-react";
import TransformerScrollCanvas from "@/components/TransformerScrollCanvas";
import { TRANSFORMER } from "@/data/transformerData";

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Text fades out as user scrolls deeper into the sequence
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  const textScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  // Smooth fade-out at the end for seamless parallax exit
  const heroFadeOut = useTransform(scrollYProgress, [0.65, 0.9], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0.65, 0.9], [1, 0.92]);
  const heroBlur = useTransform(scrollYProgress, [0.65, 0.9], [0, 8]);
  const heroFilter = useMotionTemplate`blur(${heroBlur}px)`;

  // End text fades IN on the final frames, then fades out with hero exit
  const endTextOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65, 0.85], [0, 1, 1, 0]);
  const endTextY = useTransform(scrollYProgress, [0.35, 0.5], [40, 0]);
  const endTextScale = useTransform(scrollYProgress, [0.35, 0.5], [0.96, 1]);

  return (
    <section ref={containerRef} className="relative h-[200vh]">
      {/* Sticky viewport with smooth exit */}
      <motion.div
        style={{
          opacity: heroFadeOut,
          scale: heroScale,
          filter: heroFilter,
        }}
        className="sticky top-0 h-screen w-full overflow-hidden will-change-transform origin-center"
      >
        {/* Scroll-driven frame sequence */}
        <TransformerScrollCanvas
          scrollYProgress={scrollYProgress}
          totalFrames={TRANSFORMER.totalFrames}
          imageFolderPath={TRANSFORMER.folder}
        />

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-black/70 via-black/20 to-black/5" />

        {/* Hero text — fades out on scroll */}
        <motion.div
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
          className="absolute inset-0 z-[2] flex items-end pb-24 md:pb-32 pointer-events-none will-change-transform"
        >
          <div className="px-6 md:px-12 lg:px-24 max-w-4xl pointer-events-auto">
            <div className="w-10 h-[1.5px] bg-white/50 mb-6" />

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] text-white leading-[1.08] tracking-[-0.02em] mb-6">
              Not just flowers.
              <br />
              <span className="italic text-white/90">Moments that stay.</span>
            </h1>

            <p className="font-body text-white/60 text-sm md:text-base max-w-md leading-relaxed mb-8 tracking-wide">
              Handcrafted bouquets designed around your story.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
              <button
                onClick={() =>
                  document.querySelector("#craft")?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-black px-9 py-3.5 rounded-full font-body text-[11px] tracking-[0.2em] uppercase transition-all duration-500 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Tell Us Your Story
              </button>

              <div className="mt-4 sm:mt-0 inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md text-white/80 rounded-full px-4 py-2.5 border border-white/10 text-xs tracking-wide">
                <Truck className="w-3.5 h-3.5" />
                <span className="font-body font-medium">Delivery available</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* End text — fades IN on final frames */}
        <motion.div
          style={{ opacity: endTextOpacity, y: endTextY, scale: endTextScale }}
          className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none will-change-transform"
        >
          <div className="text-center px-6 max-w-2xl">
            <p className="font-body text-[10px] md:text-xs tracking-[0.35em] uppercase text-white/50 mb-4">
              Crafted with love by Malar
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] tracking-[-0.01em] mb-5">
              Every petal,{" "}
              <span className="italic text-white/85">a promise.</span>
            </h2>
            <p className="font-body text-white/50 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              From our hands to your heart — bouquets that speak when words fall short.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
