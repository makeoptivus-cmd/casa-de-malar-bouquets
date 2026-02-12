import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, AlertCircle, Camera, ImageOff, ArrowLeft, RefreshCw } from "lucide-react";
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
      className={`flex justify-center ${isLeft ? "md:justify-start" : "md:justify-end"}`}
    >
      <motion.div
        whileHover={{ scale: 1.03, transition: { duration: 0.4 } }}
        className="w-full max-w-[280px] sm:max-w-xs md:max-w-sm group cursor-pointer"
      >
        <div className="photo-card overflow-hidden mb-4 transition-shadow duration-500 group-hover:shadow-[var(--glow-shadow)] bg-gradient-to-br from-gray-100 to-gray-200 aspect-[3/4] relative">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-3" />
              <p className="text-muted-foreground text-sm">Loading image…</p>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageOff className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm font-medium">Image unavailable</p>
            </div>
          ) : (
            <motion.img
              ref={imageRef}
              src={bouquet.image_url}
              alt={bouquet.name}
              style={{ y: imageY, opacity: imageLoaded ? 1 : 0 }}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
        <motion.div 
          className="text-center px-2"
          style={{ opacity }}
        >
          <p className="font-serif text-xl md:text-2xl mb-1">{bouquet.name}</p>
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

      <div className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center mb-12 md:mb-20"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Previous Work
          </p>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-snug">
            Moments We've <span className="italic">Crafted</span>
          </h1>
        </motion.div>

        {/* Staircase timeline */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Loading our portfolio…</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-8 border border-destructive/30 rounded-2xl text-center bg-destructive/5">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-semibold mb-1">Error loading portfolio</p>
            <p className="text-muted-foreground text-sm mb-5">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                loadBouquets();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive text-destructive-foreground rounded-full text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : bouquets.length === 0 ? (
          <div className="max-w-md mx-auto p-10 border border-border/60 rounded-2xl text-center">
            <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-serif text-lg mb-1">No portfolio items yet</p>
            <p className="text-muted-foreground text-sm">
              Check back soon — new arrangements are on the way.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-10 md:space-y-16">
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
          <Link to="/" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PreviousWorkPage;
