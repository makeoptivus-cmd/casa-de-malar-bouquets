import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPortfolioItems, PortfolioItem } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAddedToCart(false);
  }, [id]);

  const loadProduct = async () => {
    try {
      const items = await getPortfolioItems();
      const found = items.find((item) => item.id === id);
      if (found) {
        setProduct(found);
        const images = found.image_urls?.length ? found.image_urls : [found.image_url];
        setSelectedImage(images[0]);
        const related = items.filter((item) => item.id !== found.id).slice(0, 3);
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
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button onClick={() => navigate('/previous-work')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const allImages = product.image_urls?.length ? product.image_urls : [product.image_url];
  const price = product.price || 0;
  const isFreeDelivery = price >= 2000;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="pt-18 sm:pt-20 pb-9 sm:pb-12 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-5 transition-colors text-sm sm:text-base"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </motion.button>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-5 sm:gap-7 md:gap-9">
          {/* Left - Images and Video */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="mb-3 sm:mb-4">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-[340px] sm:h-[420px] md:h-[500px] lg:h-[560px] object-contain sm:object-cover bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-md sm:rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    title={`Image ${idx + 1}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}

                {product.video_url && (
                  <a
                    href={product.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-md sm:rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-all bg-black"
                    title="Open video"
                  >
                    <video
                      src={product.video_url}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 leading-tight">
              {product.name}
              {product.item_code && (
                <span className="block sm:inline text-gray-500 text-lg sm:text-2xl md:text-3xl sm:ml-3 mt-1 sm:mt-0">({product.item_code})</span>
              )}
            </h1>

            <div className="mb-4">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">₹ {price.toFixed(2)}</p>
              {isFreeDelivery && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-flex">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold text-sm">Free Delivery</span>
                </div>
              )}
              {!isFreeDelivery && price > 0 && (
                <p className="text-sm text-gray-600">
                  Add ₹ {(2000 - price).toFixed(2)} more for free delivery
                </p>
              )}
            </div>

            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-auto">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full text-base sm:text-lg py-5 sm:py-6 mb-4"
                disabled={addedToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </Button>

              {addedToCart && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-green-700 bg-green-50 py-2 rounded-lg"
                >
                  ✓ Item added to cart successfully
                </motion.div>
              )}

              {relatedProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mt-6"
                >
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wider">
                      Related Products
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Scroll to see</p>
                  </div>
                  <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
                    {relatedProducts.map((related) => {
                      const relatedImage = related.image_urls?.[0] || related.image_url;
                      return (
                        <Link
                          key={related.id}
                          to={`/product/${related.id}`}
                          className="min-w-[150px] sm:min-w-[180px] md:min-w-[210px] block rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all"
                        >
                          <img
                            src={relatedImage}
                            alt={related.name}
                            className="w-full aspect-square object-cover"
                          />
                          <div className="p-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{related.name}</p>
                            {related.item_code && (
                              <p className="text-[11px] text-gray-500">({related.item_code})</p>
                            )}
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">₹ {(related.price || 0).toFixed(2)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
