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
    <section className="section-padding max-w-5xl mx-auto overflow-hidden">
      {/* Header - ENLARGED */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-center mb-10 sm:mb-14 md:mb-16 lg:mb-20"
      >
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-body text-sm sm:text-base tracking-[0.3em] sm:tracking-[0.35em] uppercase text-muted-foreground mb-5 sm:mb-6"
        >
          Portfolio
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight sm:leading-snug mb-6 sm:mb-8 md:mb-10 px-4"
        >
          Moments We've <span className="italic">Crafted</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="font-body text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed sm:leading-loose px-4 sm:px-6"
        >
          Each arrangement is a chapter in someone's love story, a whispered apology, 
          a celebration of life's fleeting beauty.
        </motion.p>
      </motion.div>

      {/* Portfolio Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Loading portfolio...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">No portfolio items yet.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="grid grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4"
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
        <Link
          to="/previous-work"
          className="btn-outline inline-block text-sm sm:text-base"
        >
          See Previous Works →
        </Link>
      </motion.div>
    </section>
  );
};

// Portfolio Card Component - With Alternating Rotation
const PortfolioCard = ({ 
  item, 
  index 
}: { 
  item: PortfolioItem; 
  index: number;
}) => {
  // Alternating rotation pattern: -2°, 0°, 2°
  const getRotation = (idx: number) => {
    const pattern = [-2, 0, 2];
    return pattern[idx % 3];
  };

  // Alternating Y offset for staggered effect
  const getYOffset = (idx: number) => {
    const pattern = [0, -8, 0];
    return pattern[idx % 3];
  };

  const rotation = getRotation(index);
  const yOffset = getYOffset(index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      whileInView={{ 
        opacity: 1, 
        y: yOffset, 
        rotate: rotation 
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="group cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Link to="/previous-work" className="block">
        {/* Image Container - Responsive sizing with rotation */}
        <motion.div 
          className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl mb-2 sm:mb-3 md:mb-4 bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 aspect-[3/4]"
          whileHover={{ 
            scale: 1.05, 
            y: -12, 
            rotate: 0,
            transition: { duration: 0.4, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src={item.image_url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Mobile: Title overlay on image */}
          <div className="sm:hidden absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <h3 className="font-serif text-white text-xs text-center font-semibold drop-shadow-lg leading-tight">
              {item.name}
            </h3>
          </div>
        </motion.div>
        
        {/* Desktop/Tablet: Title and description below image */}
        <motion.div 
          className="hidden sm:block text-center px-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
        >
          <h3 className="font-serif text-sm md:text-base lg:text-lg xl:text-xl mb-1 group-hover:text-gray-700 transition-colors duration-300 leading-tight">
            {item.name}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default PortfolioPreviewSection;