import { motion } from "framer-motion";
import heroBouquet from "@/assets/hero-bouquet.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBouquet}
          alt="Elegant bouquet of blush roses and peonies"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl text-primary-foreground leading-tight mb-8"
        >
          Not just flowers.
          <br />
          <span className="italic">Moments that stay.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
        >
          <button
            onClick={() => document.querySelector("#craft")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-background/90 text-foreground px-10 py-4 rounded-full font-body text-sm tracking-widest uppercase transition-all duration-500 hover:bg-background hover:shadow-lg"
          >
            Tell Us Your Story
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
