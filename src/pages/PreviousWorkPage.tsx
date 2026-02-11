import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import bouquet1 from "@/assets/bouquet-1.jpg";
import bouquet2 from "@/assets/bouquet-2.jpg";
import bouquet3 from "@/assets/bouquet-3.jpg";

const bouquets = [
  { id: 1, title: "First Proposal", image: bouquet1 },
  { id: 2, title: "Apology Bouquet", image: bouquet2 },
  { id: 3, title: "Birthday Surprise", image: bouquet3 },
];

const BouquetCard = ({ bouquet, index }: { bouquet: typeof bouquets[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 1, 1, 0.2]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);

  const isLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <motion.div
        whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
        className="w-full max-w-md group cursor-pointer"
        style={{ marginTop: index * 40 }}
      >
        <div className="photo-card overflow-hidden mb-4 transition-shadow duration-500 group-hover:shadow-[var(--glow-shadow)]">
          <img
            src={bouquet.image}
            alt={bouquet.title}
            className="w-full aspect-[3/4] object-cover"
          />
        </div>
        <p className="font-serif text-xl md:text-2xl text-center">{bouquet.title}</p>
      </motion.div>
    </motion.div>
  );
};

const PreviousWorkPage = () => {
  return (
    <div className="relative">
      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center mb-20"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Previous Work
          </p>
          <h1 className="font-serif text-4xl md:text-6xl leading-snug">
            Moments We've <span className="italic">Crafted</span>
          </h1>
        </motion.div>

        {/* Staircase timeline */}
        <div className="max-w-5xl mx-auto space-y-12 md:space-y-20">
          {bouquets.map((bouquet, i) => (
            <BouquetCard key={bouquet.id} bouquet={bouquet} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-20"
        >
          <Link to="/" className="btn-outline inline-block">
            ← Back to Home
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PreviousWorkPage;
