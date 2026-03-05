import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  
  const subtotal = getCartTotal();
  const total = subtotal;

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    const phone = '918825586566';
    const itemLines = cartItems.map((item, index) => {
      const code = item.item_code ? ` (${item.item_code})` : '';
      const price = (item.price || 0).toFixed(2);
      return `${index + 1}. ${item.name}${code}\n   Qty: ${item.quantity} | Price: Rs.${price}`;
    });

    const message = [
      'Hello Casa De Malar, I would like to place an order:',
      '',
      ...itemLines,
      '',
      `Total: Rs.${total.toFixed(2)}`,
    ].join('\n');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 px-4 min-h-[70vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h2 className="font-serif text-3xl mb-3">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some beautiful bouquets to your cart</p>
            <Button onClick={() => navigate('/previous-work')} size="lg">
              Browse Products
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="pt-18 sm:pt-20 pb-10 sm:pb-12 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </button>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Shopping Cart</h1>
              <p className="text-gray-600 mt-2">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
            </div>
            <Button variant="outline" onClick={clearCart} className="gap-2 w-full sm:w-auto">
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item, index) => {
                const itemPrice = item.price || 0;
                const itemTotal = itemPrice * item.quantity;
                const primaryImage = item.image_urls?.[0] || item.image_url;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 p-3.5 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-2 inline-block w-4 h-4 rounded-sm border border-gray-300 bg-emerald-50" aria-hidden="true" />
                      <img
                        src={primaryImage}
                        alt={item.name}
                        className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-lg sm:text-xl font-semibold line-clamp-2">
                            {item.name}
                            {item.item_code && (
                              <span className="text-gray-500 text-sm ml-2">({item.item_code})</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                          <p className="text-xs text-emerald-700 font-medium mt-2">In Stock</p>
                          <p className="text-sm text-gray-700 mt-1">Unit Price: ₹ {itemPrice.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                        <span className="text-xs text-gray-500">Qty</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="md:text-right flex md:block items-center justify-between border-t md:border-t-0 pt-3 md:pt-0">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Item Total</p>
                      <p className="font-semibold text-lg">₹ {itemTotal.toFixed(2)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="border border-gray-200 rounded-xl p-4 sm:p-5 lg:sticky lg:top-24">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-3 gap-2" onClick={handleWhatsAppOrder}>
                  <MessageCircle className="w-4 h-4" />
                  DM to Order
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/previous-work')}>
                  Continue Shopping
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
