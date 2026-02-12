// ============================================================================
// COMPLETE PORTFOLIO GALLERY SYSTEM
// ============================================================================
// This file contains TWO components:
// 1. PreviousWorkPage - Full portfolio page with scroll animations
// 2. PortfolioPreviewSection - Home page preview section
// ============================================================================

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, List } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPortfolioItems, PortfolioItem } from "@/lib/supabase";

// ============================================================================
// COMPONENT 1: PREVIOUS WORK PAGE
// ============================================================================

const BouquetCard = ({ 
  bouquet, 
  index, 
  layout 
}: { 
  bouquet: PortfolioItem; 
  index: number;
  layout: 'grid' | 'staircase';
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Mobile: Reduce animation intensity by 60%
  const mobileMultiplier = isMobile ? 0.4 : 1;
  const isLeft = index % 2 === 0;
  
  // Floating Garden Effect - Gentle & Organic
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80 * mobileMultiplier, 0, -80 * mobileMultiplier]);
  const x = useTransform(scrollYProgress, [0, 0.5, 1], isLeft ? [-20 * mobileMultiplier, 0, 20 * mobileMultiplier] : [20 * mobileMultiplier, 0, -20 * mobileMultiplier]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], isLeft ? [-3 * mobileMultiplier, 0, 3 * mobileMultiplier] : [3 * mobileMultiplier, 0, -3 * mobileMultiplier]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.9]);
  const imageY = useTransform(scrollYProgress, [0, 1], [30 * mobileMultiplier, -30 * mobileMultiplier]);

  // Spring physics for natural movement
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothY = useSpring(y, springConfig);
  const smoothX = useSpring(x, springConfig);
  const smoothRotate = useSpring(rotate, springConfig);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Grid layout
  if (layout === 'grid') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        className="group cursor-pointer"
      >
        <motion.div
          whileHover={isMobile ? {} : { y: -8, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.98 }}
          className="h-full flex flex-col"
        >
          <div className="relative overflow-hidden mb-2 sm:mb-3 transition-all duration-500 group-hover:shadow-xl rounded-lg sm:rounded-xl bg-white aspect-[3/4] border border-gray-200">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-1 sm:mb-2"></div>
                <p className="text-gray-400 text-[10px] sm:text-xs hidden sm:block">Loading...</p>
              </div>
            )}
            
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 text-center bg-gray-50">
                <p className="text-gray-400 text-[10px] sm:text-xs font-medium">📷</p>
              </div>
            ) : (
              <motion.img
                src={bouquet.image_url}
                alt={bouquet.name}
                style={{ y: imageY, opacity: imageLoaded ? 1 : 0 }}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:hidden bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="font-serif text-white text-xs font-medium text-center drop-shadow-lg">
                {bouquet.name}
              </h3>
            </div>
          </div>

          <div className="text-center px-1 sm:px-2 hidden sm:block">
            <h3 className="font-serif text-base md:text-lg lg:text-xl mb-1 text-gray-900 leading-tight">
              {bouquet.name}
            </h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2">
              {bouquet.description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Staircase layout
  return (
    <motion.div
      ref={ref}
      style={{ opacity, y: smoothY, x: smoothX, rotate: smoothRotate, scale }}
      className={`flex ${isLeft ? "justify-start" : "justify-end"} px-4 sm:px-0`}
    >
      <motion.div
        whileHover={isMobile ? {} : { scale: 1.05, y: -10, transition: { duration: 0.4, type: "spring", stiffness: 300 } }}
        whileTap={{ scale: 0.97 }}
        className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[420px] group cursor-pointer"
      >
        <div className="relative overflow-hidden mb-4 transition-all duration-500 group-hover:shadow-2xl rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 aspect-[3/4] shadow-lg">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-10 h-10 md:w-12 md:h-12 border-3 md:border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 text-xs md:text-sm">Loading bouquet...</p>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Image unavailable</p>
                <p className="text-gray-400 text-xs">Please check your connection</p>
              </div>
            </div>
          ) : (
            <motion.img
              ref={imageRef}
              src={bouquet.image_url}
              alt={bouquet.name}
              style={{ y: imageY, opacity: imageLoaded ? 1 : 0, scale: 1.05 }}
              className="w-full h-full object-cover transition-opacity duration-500"
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <motion.div className="text-center px-2" style={{ opacity }}>
          <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 text-gray-900 leading-tight">
            {bouquet.name}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
            {bouquet.description}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const PreviousWorkPage = () => {
  const [bouquets, setBouquets] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'staircase'>('staircase');

  const { scrollYProgress } = useScroll();
  const pageProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    loadBouquets();
  }, []);

  const loadBouquets = async () => {
    try {
      const data = await getPortfolioItems();
      setBouquets(data);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load portfolio items';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-900 origin-left z-50"
        style={{ scaleX: pageProgress }}
      />

      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10 sm:mb-12 md:mb-16 max-w-4xl mx-auto"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-body text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gray-500 mb-3 sm:mb-4"
          >
            Previous Work
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight sm:leading-snug px-4 mb-4 sm:mb-6"
          >
            Moments We've <span className="italic text-gray-700">Crafted</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed"
          >
            Each bouquet tells a story. Browse through our collection of elegant arrangements
            crafted with love and attention to detail.
          </motion.p>
        </motion.div>

        {/* Layout Toggle */}
        {!loading && !error && bouquets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-col items-center gap-3 mb-8 sm:mb-10 md:mb-12"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="text-gray-500 text-xs sm:text-sm"
            >
              Choose your view
            </motion.p>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4, type: "spring" }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border-2 border-gray-300 rounded-full p-1 sm:p-1.5 shadow-lg"
            >
              <button
                onClick={() => setLayout('staircase')}
                aria-label="Floating garden view"
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
                  layout === 'staircase'
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-semibold">Floating</span>
              </button>
              <button
                onClick={() => setLayout('grid')}
                aria-label="Grid view"
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
                  layout === 'grid'
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-semibold">Grid</span>
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 sm:py-32"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
            <p className="text-gray-500 text-sm sm:text-base font-medium">Loading our beautiful bouquets...</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">This won't take long</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-6 sm:p-8 bg-red-50 border-2 border-red-200 rounded-2xl text-center shadow-lg"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-red-700 font-semibold mb-2 text-base sm:text-lg">Error loading portfolio</p>
            <p className="text-red-600 text-xs sm:text-sm mb-6">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                loadBouquets();
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg hover:scale-105"
            >
              Try Again
            </button>
          </motion.div>
        ) : bouquets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-6 sm:p-8 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center shadow-lg"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <p className="text-blue-700 font-semibold mb-2 text-base sm:text-lg">No portfolio items yet</p>
            <p className="text-blue-600 text-xs sm:text-sm mb-4">
              Admin, go to <Link to="/admin" className="font-bold underline hover:text-blue-800 transition-colors">/admin</Link> to add your first bouquet!
            </p>
          </motion.div>
        ) : layout === 'grid' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto"
          >
            {bouquets.map((bouquet, i) => (
              <BouquetCard key={bouquet.id} bouquet={bouquet} index={i} layout="grid" />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="max-w-6xl mx-auto space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24"
          >
            {bouquets.map((bouquet, i) => (
              <BouquetCard key={bouquet.id} bouquet={bouquet} index={i} layout="staircase" />
            ))}
          </motion.div>
        )}

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-16 sm:mt-20 md:mt-24 pt-8 border-t border-gray-200"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base font-semibold shadow-md hover:shadow-xl hover:scale-105"
          >
            <span className="text-lg">←</span>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

// ============================================================================
// COMPONENT 2: PORTFOLIO PREVIEW SECTION (FOR HOME PAGE)
// ============================================================================

export const PortfolioPreviewSection = () => {
  const [bouquets, setBouquets] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBouquets();
  }, []);

  const loadBouquets = async () => {
    try {
      const data = await getPortfolioItems();
      setBouquets(data.slice(0, 3)); // Get only first 3 items
    } catch (err) {
      console.error('Failed to load portfolio preview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#f5f3f0]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading portfolio...</p>
          </motion.div>
        </div>
      </section>
    );
  }

  if (bouquets.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#f5f3f0]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-body text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gray-500 mb-3 sm:mb-4"
          >
            Our Work
          </motion.p>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4 sm:mb-6"
          >
            Recent <span className="italic text-gray-700">Creations</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4"
          >
            Discover our latest floral arrangements, each crafted with passion and attention to detail.
          </motion.p>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-8 lg:gap-10 mb-8 sm:mb-12">
          {bouquets.map((bouquet, index) => (
            <motion.div
              key={bouquet.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
              className="group cursor-pointer"
            >
              <Link to="/previous-work" className="block">
                <motion.div 
                  className="relative overflow-hidden rounded-lg sm:rounded-xl aspect-[3/4] bg-white border border-gray-200 mb-2 sm:mb-4 transition-all duration-500 group-hover:shadow-xl"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={bouquet.image_url}
                    alt={bouquet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:hidden bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    <h3 className="font-serif text-white text-xs text-center font-semibold drop-shadow-lg leading-tight">
                      {bouquet.name}
                    </h3>
                  </div>
                </motion.div>

                <motion.div 
                  className="text-center hidden sm:block px-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                >
                  <h3 className="font-serif text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 mb-1 sm:mb-2 group-hover:text-gray-700 transition-colors">
                    {bouquet.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2">
                    {bouquet.description}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-center"
        >
          <Link
            to="/previous-work"
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base font-semibold shadow-md hover:shadow-xl hover:scale-105"
          >
            <span>See Previous Works</span>
            <span className="text-lg">→</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default PreviousWorkPage;