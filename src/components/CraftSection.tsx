import { motion } from "framer-motion";
import craftImage from "@/assets/craft-florist.jpg";

const CraftSection = () => {
  return (
    <section id="craft" className="section-padding max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Left — image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <img
            src={craftImage}
            alt="Florist carefully tying a ribbon on a handmade bouquet"
            className="photo-card w-full aspect-[4/5] object-cover"
          />
        </motion.div>

        {/* Right — text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            The Craft
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-snug mb-6">
            Handmade with
            <br />
            <span className="italic">intention</span>
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed mb-4">
            Every petal is chosen with purpose. Every stem placed to echo the emotion 
            you wish to share. At Casa De Malar, bouquets aren't assembled — they're 
            composed, like a piece of music written just for your moment.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed mb-10">
            Malar works personally with each client, listening to the story behind the occasion 
            before a single flower is touched.
          </p>

          <button className="btn-primary">
            Connect With Malar
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CraftSection;
