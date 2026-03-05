import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-5 md:px-12 py-2.5 sm:py-3 md:py-5">
        <Link to="/" className="font-serif text-lg sm:text-2xl md:text-3xl tracking-tight text-foreground truncate max-w-[55vw] sm:max-w-none">Casa De Malar</Link>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link
            to="/cart"
            className="relative group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          <a
            href="tel:8825586566"
            className="group flex items-center gap-1.5 sm:gap-2.5 bg-primary text-primary-foreground px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full font-body text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase transition-all duration-500 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]"
          >
            <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">Call Malar</span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
