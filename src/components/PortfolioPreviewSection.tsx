import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPortfolioItems, PortfolioItem } from "@/lib/supabase";

const PortfolioPreviewSection = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getPortfolioItems();
      setItems(data.slice(0, 3)); // Show only first 3 items in preview
    } catch (error) {
      console.error('Error loading portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-center mb-12"
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
      </motion.div>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No portfolio items yet.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {items.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center"
      >
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

// Portfolio Card Component
const PortfolioCard = ({ item, index }: { item: PortfolioItem; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-200">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          crossOrigin="anonymous"
        />
      </div>
      <h3 className="font-serif text-xl mb-2">{item.name}</h3>
      <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
    </motion.div>
  );
};

export default PortfolioPreviewSection;
