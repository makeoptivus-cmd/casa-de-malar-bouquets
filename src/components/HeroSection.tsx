import { motion } from "framer-motion";
import { Truck } from 'lucide-react';
import heroBouquet from "@/assets/hero-bouquet.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-end pb-20 md:pb-32 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={heroBouquet}
          alt="Elegant bouquet of blush roses and peonies"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="line-accent mb-8"
        />

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-primary-foreground leading-[1.05] mb-8"
        >
          Not just flowers.
          <br />
          <span className="italic">Moments that stay.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <button
              onClick={() => document.querySelector("#craft")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-background/90 text-foreground px-10 py-4 rounded-full font-body text-xs tracking-[0.2em] uppercase transition-all duration-500 hover:bg-background hover:shadow-xl hover:scale-[1.02]"
            >
              Tell Us Your Story
            </button>

            {/* Delivery badge */}
            <div className="mt-4 sm:mt-0 inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm text-foreground rounded-full px-3 py-2 shadow-sm border border-border/20 text-sm">
              <Truck className="w-4 h-4 text-foreground" />
              <span className="font-semibold">Delivery available</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
