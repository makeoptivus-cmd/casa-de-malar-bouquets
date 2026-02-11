import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PortfolioPreviewSection = () => {
  return (
    <section className="section-padding max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Portfolio
        </p>
        <h2 className="font-serif text-3xl md:text-5xl leading-snug mb-6">
          Moments We've <span className="italic">Crafted</span>
        </h2>
        <p className="font-body text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
          Each arrangement is a chapter in someone's love story, a whispered apology, 
          a celebration of life's fleeting beauty.
        </p>

        <Link
          to="/previous-work"
          className="btn-outline inline-block"
        >
          See Previous Works →
        </Link>
      </motion.div>
    </section>
  );
};

export default PortfolioPreviewSection;
