import React, { useEffect, useRef } from "react";
import { MotionValue, useMotionValue } from "framer-motion";

type Props = {
    scrollYProgress: MotionValue<number>;
    totalFrames?: number;
    imageFolderPath?: string;
};

/**
 * Scroll-driven image-sequence canvas.
 * Renders extracted frames (1.jpg … N.jpg) based on scrollYProgress [0..1].
 * High-DPI aware, object-fit: cover for fullscreen cinematic feel.
 */
const TransformerScrollCanvas: React.FC<Props> = ({
    scrollYProgress,
    totalFrames = 121,
    imageFolderPath = "/images/transformer-sequence/",
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imagesRef = useRef<Array<HTMLImageElement | null>>(Array(totalFrames).fill(null));
    const loadedMapRef = useRef<Record<number, boolean>>({});
    const rafRef = useRef<number | null>(null);
    const lastDrawnRef = useRef<number>(-1);
    const requestedFrame = useMotionValue(0);

    // Map scroll progress → frame index
    useEffect(() => {
        const unsub = scrollYProgress.on("change", (v) => {
            const clamped = Math.max(0, Math.min(1, v));
            const idx = Math.max(0, Math.min(totalFrames - 1, Math.floor(clamped * totalFrames)));
            requestedFrame.set(idx);
        });
        return unsub;
    }, [scrollYProgress, requestedFrame, totalFrames]);

    // Preload frames progressively in batches
    useEffect(() => {
        let cancelled = false;

        const load = (i: number) =>
            new Promise<void>((resolve) => {
                const img = new Image();
                img.src = `${imageFolderPath}${i + 1}.jpg`;
                img.decoding = "async";
                img.onload = () => {
                    imagesRef.current[i] = img;
                    loadedMapRef.current[i] = true;
                    resolve();
                };
                img.onerror = () => {
                    imagesRef.current[i] = null;
                    resolve();
                };
            });

        (async () => {
            // Load key frames first for fast initial display
            const keyFrames = [0, Math.floor(totalFrames / 4), Math.floor(totalFrames / 2), Math.floor((3 * totalFrames) / 4), totalFrames - 1];
            for (const i of keyFrames) {
                if (cancelled) return;
                await load(i);
            }
            // Then fill in the rest in batches
            const batchSize = 15;
            for (let start = 0; start < totalFrames; start += batchSize) {
                if (cancelled) return;
                const batch: Promise<void>[] = [];
                for (let i = start; i < Math.min(start + batchSize, totalFrames); i++) {
                    if (!loadedMapRef.current[i]) batch.push(load(i));
                }
                await Promise.all(batch);
            }
        })();

        return () => { cancelled = true; };
    }, [imageFolderPath, totalFrames]);

    // Render loop — draws current frame to canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let mounted = true;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas!.getBoundingClientRect();
            canvas!.width = Math.floor(rect.width * dpr);
            canvas!.height = Math.floor(rect.height * dpr);
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            if (!mounted) return;
            const rect = canvas!.getBoundingClientRect();
            const canvasW = rect.width;
            const canvasH = rect.height;

            ctx!.clearRect(0, 0, canvasW, canvasH);

            const idx = Math.max(0, Math.min(totalFrames - 1, Math.floor(requestedFrame.get())));
            const img = imagesRef.current[idx];

            if (img && img.naturalWidth && img.naturalHeight) {
                // object-fit: cover — fill the entire viewport, crop overflow
                const imgAspect = img.naturalWidth / img.naturalHeight;
                const canvasAspect = canvasW / canvasH;
                let drawW: number, drawH: number, dx: number, dy: number;

                if (imgAspect > canvasAspect) {
                    // Image wider → fit height, crop sides
                    drawH = canvasH;
                    drawW = canvasH * imgAspect;
                    dx = (canvasW - drawW) / 2;
                    dy = 0;
                } else {
                    // Image taller → fit width, crop top/bottom
                    drawW = canvasW;
                    drawH = canvasW / imgAspect;
                    dx = 0;
                    dy = (canvasH - drawH) / 2;
                }

                ctx!.drawImage(img, dx, dy, drawW, drawH);
                lastDrawnRef.current = idx;
            } else {
                // Try nearest loaded frame as fallback
                let fallback: HTMLImageElement | null = null;
                for (let offset = 1; offset < totalFrames; offset++) {
                    if (imagesRef.current[Math.max(0, idx - offset)]) { fallback = imagesRef.current[Math.max(0, idx - offset)]; break; }
                    if (imagesRef.current[Math.min(totalFrames - 1, idx + offset)]) { fallback = imagesRef.current[Math.min(totalFrames - 1, idx + offset)]; break; }
                }
                if (fallback && fallback.naturalWidth) {
                    const imgAspect = fallback.naturalWidth / fallback.naturalHeight;
                    const canvasAspect = canvasW / canvasH;
                    let drawW: number, drawH: number, dx: number, dy: number;
                    if (imgAspect > canvasAspect) {
                        drawH = canvasH; drawW = canvasH * imgAspect; dx = (canvasW - drawW) / 2; dy = 0;
                    } else {
                        drawW = canvasW; drawH = canvasW / imgAspect; dx = 0; dy = (canvasH - drawH) / 2;
                    }
                    ctx!.drawImage(fallback, dx, dy, drawW, drawH);
                }
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            mounted = false;
            window.removeEventListener("resize", resize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [totalFrames, requestedFrame]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full"
        />
    );
};

export default TransformerScrollCanvas;
