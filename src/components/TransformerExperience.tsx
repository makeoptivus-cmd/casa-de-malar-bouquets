import React, { useEffect, useState } from "react";
import { MotionValue, useTransform, motion } from "framer-motion";
import { TRANSFORMER } from "@/data/transformerData";

type Props = {
    scrollYProgress: MotionValue<number>;
};

const TransformerExperience: React.FC<Props> = ({ scrollYProgress }) => {
    const totalFrames = TRANSFORMER.totalFrames;

    // Phase opacities
    const heroOpacity = useTransform(scrollYProgress, [0, 0.25, 0.3], [1, 0.6, 0]);
    const transformOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.7, 0.8], [0, 1, 1, 0]);
    const arrivalOpacity = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 0.6, 1]);

    // small translate for motion
    const transformY = useTransform(scrollYProgress, [0.25, 0.8], [18, -6]);
    const arrivalY = useTransform(scrollYProgress, [0.75, 1], [8, 0]);

    // frame counter synced to scroll (subscribe for rendered text)
    const frameNumber = useTransform(scrollYProgress, [0, 1], [1, totalFrames]);
    const [frame, setFrame] = useState<number>(1);
    useEffect(() => {
        const unsub = frameNumber.on("change", (v) => setFrame(Math.max(1, Math.round(v))));
        return unsub;
    }, [frameNumber]);
    // subtle HUD rails
    return (
        <div className="pointer-events-none absolute inset-0 z-10 grid h-full w-full">
            {/* Accessible summary for screen readers */}
            <div className="sr-only" aria-live="polite">
                Transformer sequence — {totalFrames} frames. Scroll to progress from vehicle to humanoid.
            </div>

            {/* Left / edge content */}
            <div className="absolute left-6 top-1/4 max-w-xs text-left">
                <motion.div style={{ opacity: heroOpacity }} className="text-left text-sm text-foreground/60 font-ui">
                    <div className="uppercase tracking-widest text-xs text-foreground/50">{TRANSFORMER.hud.hero.subtitle}</div>
                    <h2 className="font-heading mt-4 text-3xl md:text-4xl text-white leading-tight">{TRANSFORMER.hud.hero.title}</h2>
                </motion.div>

                <motion.div style={{ opacity: transformOpacity, y: transformY }} className="mt-8 text-xs text-foreground/40 font-ui">
                    <div className="flex items-center gap-4 text-[10px] tracking-[0.22em] uppercase text-foreground/50">
                        <span className="bg-neutral-carbon/30 rounded-md px-2 py-1">DIAGNOSTICS</span>
                        <span className="font-mono">{TRANSFORMER.hud.transform[1]}</span>
                    </div>

                    <div className="mt-4 font-mono text-sm text-foreground/40">FRAME&nbsp;
                        <motion.span style={{ opacity: transformOpacity }}>{frame}</motion.span>
                        <span className="text-foreground/30"> / {totalFrames}</span>
                    </div>

                    <div className="mt-3 text-xs text-foreground/40">{TRANSFORMER.hud.transform[0]}</div>
                </motion.div>
            </div>

            {/* Right / arrival content */}
            <div className="absolute right-6 bottom-32 max-w-sm text-right">
                <motion.div style={{ opacity: arrivalOpacity, y: arrivalY }} className="font-ui">
                    <div className="text-xs uppercase tracking-widest text-foreground/40 mb-3">ARRIVAL</div>
                    <h3 className="font-heading text-4xl text-white mb-3">{TRANSFORMER.hud.arrival.title}</h3>
                    <div className="text-sm text-foreground/50 mb-6">{TRANSFORMER.hud.arrival.signature}</div>

                    <a
                        href="/"
                        className="inline-block pointer-events-auto rounded-full border border-white/6 px-6 py-3 text-xs uppercase tracking-[0.18em] font-ui text-white/90 bg-white/2 backdrop-blur-sm hover:bg-white/4 transition"
                        onClick={(e) => {
                            /* allow keyboard focus + click but keep pointer-events disabled on parent */
                        }}
                    >
                        {TRANSFORMER.hud.arrival.cta}
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default TransformerExperience;
