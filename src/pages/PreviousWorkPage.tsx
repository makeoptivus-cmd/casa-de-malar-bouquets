import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPortfolioItems, PortfolioItem } from "@/lib/supabase";

const BouquetCard = ({ bouquet, index }: { bouquet: PortfolioItem; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // Opacity: fade in as you scroll to it, fade out as you scroll past
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  
  // Y position: smooth upward movement as you scroll
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  
  // Scale: grow slightly as you scroll to it
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.85]);
  
  // Image parallax: moves slightly slower creating parallax effect
  const imageY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const isLeft = index % 2 === 0;

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    console.log('✓ Image loaded:', bouquet.image_url);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
    console.error('✗ Image failed to load:', bouquet.image_url);
  };

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <motion.div
        whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}
        className="w-full max-w-md group cursor-pointer"
        style={{ marginTop: index * 40 }}
      >
        <div className="photo-card overflow-hidden mb-4 transition-shadow duration-500 group-hover:shadow-[var(--glow-shadow)] bg-gradient-to-br from-gray-200 to-gray-300 aspect-[3/4] flex items-center justify-center">
          {!imageLoaded && !imageError && (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading image...</p>
            </div>
          )}
          
          {imageError ? (
            <div className="text-center p-4">
              <p className="text-gray-600 text-sm font-medium">❌ Image Failed to Load</p>
              <p className="text-gray-500 text-xs mt-1 break-words">{bouquet.image_url}</p>
            </div>
          ) : (
            <motion.img
              ref={imageRef}
              src={bouquet.image_url}
              alt={bouquet.name}
              style={{ y: imageY, opacity: imageLoaded ? 1 : 0 }}
              className="w-full h-full object-cover transition-opacity duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
          )}
        </div>
        <motion.div 
          className="text-center"
          style={{ opacity }}
        >
          <p className="font-serif text-xl md:text-2xl mb-2">{bouquet.name}</p>
          <p className="text-muted-foreground text-sm">{bouquet.description}</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const PreviousWorkPage = () => {
  const [bouquets, setBouquets] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBouquets();
  }, []);

  const loadBouquets = async () => {
    try {
      console.log('📸 Loading portfolio items...');
      const data = await getPortfolioItems();
      console.log(`✓ Loaded ${data.length} portfolio items:`, data);
      if (data.length === 0) {
        console.warn('⚠️ No portfolio items found. Go to /admin to add items.');
      }
      setBouquets(data);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load portfolio items';
      console.error('✗ Error loading bouquets:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading our portfolio...</p>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-700 font-medium mb-2">❌ Error loading portfolio</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                loadBouquets();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bouquets.length === 0 ? (
          <div className="max-w-2xl mx-auto p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-700 font-medium mb-2">📸 No portfolio items yet</p>
            <p className="text-blue-600 text-sm mb-4">
              Admin, go to <Link to="/admin" className="font-bold underline">/admin</Link> to add your first bouquet!
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 md:space-y-20">
            {bouquets.map((bouquet, i) => (
              <BouquetCard key={bouquet.id} bouquet={bouquet} index={i} />
            ))}
          </div>
        )}

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
