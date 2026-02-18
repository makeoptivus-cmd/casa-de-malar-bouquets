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
      setItems(data.slice(0, 3));
    } catch (error) {
      console.error('Error loading portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding max-w-6xl mx-auto overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-center mb-16 md:mb-24"
      >
        <div className="line-accent mx-auto mb-6" />
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Portfolio
        </p>
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-8">
          Moments We've <span className="italic">Crafted</span>
        </h2>
        <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Each arrangement is a chapter in someone's love story, a whispered apology, 
          a celebration of life's fleeting beauty.
        </p>
      </motion.div>

      {/* Portfolio Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm font-body">Loading portfolio...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-body">No portfolio items yet.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12"
        >
          {items.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </motion.div>
      )}

      {/* See More Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center"
      >
        <Link to="/previous-work" className="btn-outline inline-block">
          See Previous Works →
        </Link>
      </motion.div>
    </section>
  );
};

const PortfolioCard = ({ item, index }: { item: PortfolioItem; index: number }) => {
  const getRotation = (idx: number) => [-2, 0, 2][idx % 3];
  const getYOffset = (idx: number) => [0, -8, 0][idx % 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      whileInView={{ opacity: 1, y: getYOffset(index), rotate: getRotation(index) }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group cursor-pointer"
    >
      <Link to="/previous-work" className="block">
        <motion.div 
          className="relative overflow-hidden rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-[var(--card-shadow)] hover:shadow-[var(--glow-shadow)] transition-shadow duration-500 aspect-[3/4]"
          whileHover={{ scale: 1.04, y: -10, rotate: 0, transition: { duration: 0.4, ease: "easeOut" } }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src={item.image_url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Mobile title */}
          <div className="sm:hidden absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/80 to-transparent">
            <h3 className="font-serif text-primary-foreground text-xs text-center leading-tight">
              {item.name}
            </h3>
          </div>
        </motion.div>
        
        {/* Desktop title */}
        <div className="hidden sm:block text-center px-1">
          <h3 className="font-serif text-sm md:text-lg mb-1 leading-tight">{item.name}</h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default PortfolioPreviewSection;
