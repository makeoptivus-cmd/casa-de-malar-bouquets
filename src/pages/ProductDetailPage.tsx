import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPortfolioItems, PortfolioItem } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, Truck, PlayCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isVideo, setIsVideo] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAddedToCart(false);
    setIsVideo(false);
  }, [id]);

  const loadProduct = async () => {
    try {
      const items = await getPortfolioItems();
      const found = items.find((item) => item.id === id);
      if (found) {
        setProduct(found);
        const images = found.image_urls?.length ? found.image_urls : [found.image_url];
        setSelectedImage(images[0]);
        const related = items.filter((item) => item.id !== found.id).slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-[3px] border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 tracking-wide">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-500">Product not found</p>
          <Button variant="outline" onClick={() => navigate('/previous-work')}>
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const allImages = product.image_urls?.length ? product.image_urls : [product.image_url];
  const price = product.price || 0;
  const isFreeDelivery = price >= 2000;
  const deliveryGap = 2000 - price;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 sm:mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* ── Product grid ── */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-14 xl:gap-20">

          {/* ── LEFT: Images ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-3"
          >
            {/* Main viewer */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
              {isVideo && product.video_url ? (
                <video
                  src={product.video_url}
                  className="w-full h-[300px] xs:h-[360px] sm:h-[440px] md:h-[500px] lg:h-[520px] xl:h-[580px] object-cover"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-[300px] xs:h-[360px] sm:h-[440px] md:h-[500px] lg:h-[520px] xl:h-[580px] object-cover"
                />
              )}
            </div>

            {/* Thumbnails */}
            {(allImages.length > 1 || product.video_url) && (
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-0.5 scroll-smooth no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImage(img); setIsVideo(false); }}
                    className={`flex-shrink-0 w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === img && !isVideo
                        ? 'border-gray-900 shadow-sm scale-[1.03]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}

                {product.video_url && (
                  <button
                    onClick={() => setIsVideo(true)}
                    className={`flex-shrink-0 w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 relative bg-black ${
                      isVideo
                        ? 'border-gray-900 shadow-sm scale-[1.03]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <video
                      src={product.video_url}
                      className="w-full h-full object-cover opacity-70"
                      muted
                      playsInline
                    />
                    <PlayCircle className="absolute inset-0 m-auto w-7 h-7 text-white drop-shadow" />
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="flex flex-col"
          >
            {/* Name + code */}
            <div className="mb-4 sm:mb-5">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-snug text-gray-900">
                {product.name}
              </h1>
              {product.item_code && (
                <p className="text-sm sm:text-base text-gray-400 mt-1 tracking-wide">
                  Code: {product.item_code}
                </p>
              )}
            </div>

            {/* Price + delivery */}
            <div className="mb-5 sm:mb-6 space-y-2">
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              {isFreeDelivery ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                  <Truck className="w-4 h-4" />
                  Free Delivery
                </span>
              ) : price > 0 ? (
                <p className="text-sm text-gray-500">
                  Add ₹{deliveryGap.toLocaleString('en-IN', { minimumFractionDigits: 2 })} more to unlock free delivery
                </p>
              ) : null}
            </div>

            {/* Description */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Description
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-6" />

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={addedToCart}
                className="w-full text-sm sm:text-base h-12 sm:h-14 rounded-xl transition-all"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </Button>

              {addedToCart && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs sm:text-sm text-green-700 bg-green-50 py-2 rounded-lg border border-green-100"
                >
                  Item added to your cart successfully
                </motion.p>
              )}
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 sm:mt-10"
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  You may also like
                </h3>

                {/* Mobile: horizontal scroll */}
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 no-scrollbar lg:hidden">
                  {relatedProducts.map((related) => {
                    const img = related.image_urls?.[0] || related.image_url;
                    return (
                      <Link
                        key={related.id}
                        to={`/product/${related.id}`}
                        className="flex-shrink-0 w-[140px] sm:w-[165px] rounded-xl overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all"
                      >
                        <img src={img} alt={related.name} className="w-full aspect-square object-cover" />
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-gray-900 truncate">{related.name}</p>
                          {related.item_code && (
                            <p className="text-[10px] text-gray-400">{related.item_code}</p>
                          )}
                          <p className="text-xs font-semibold text-gray-800 mt-1">
                            ₹{(related.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Desktop: 2-col grid */}
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  {relatedProducts.slice(0, 4).map((related) => {
                    const img = related.image_urls?.[0] || related.image_url;
                    return (
                      <Link
                        key={related.id}
                        to={`/product/${related.id}`}
                        className="flex gap-3 items-center rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all overflow-hidden p-2"
                      >
                        <img src={img} alt={related.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{related.name}</p>
                          {related.item_code && (
                            <p className="text-[10px] text-gray-400">{related.item_code}</p>
                          )}
                          <p className="text-xs font-semibold text-gray-800 mt-0.5">
                            ₹{(related.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;