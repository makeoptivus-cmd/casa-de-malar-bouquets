import { motion } from "framer-motion";
import craftImage from "@/assets/craft-florist.jpg";

const CraftSection = () => {
  return (
    <section id="craft" className="section-padding max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Left — image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <img
            src={craftImage}
            alt="Florist carefully tying a ribbon on a handmade bouquet"
            className="photo-card w-full aspect-[4/5] object-cover"
          />
          {/* Decorative border */}
          <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary/15 rounded-2xl -z-10" />
        </motion.div>

        {/* Right — text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
        >
          <div className="line-accent mb-6" />
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            The Craft
          </p>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] mb-8">
            Handmade with
            <br />
            <span className="italic">intention</span>
          </h2>
          <p className="font-body text-muted-foreground leading-[1.8] mb-4">
            Every petal is chosen with purpose. Every stem placed to echo the emotion 
            you wish to share. At Casa De Malar, bouquets aren't assembled — they're 
            composed, like a piece of music written just for your moment.
          </p>
          <p className="font-body text-muted-foreground leading-[1.8] mb-10">
            Malar works personally with each client, listening to the story behind the occasion 
            before a single flower is touched.
          </p>

          <a href="tel:8825586566" className="btn-primary inline-block">
            Call Malar
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CraftSection;
