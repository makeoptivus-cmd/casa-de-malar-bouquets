import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

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
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-5 md:py-6">
        <Link
          to="/"
          className="font-serif text-2xl md:text-3xl tracking-tight text-foreground"
        >
          Casa De Malar
        </Link>

        <a
          href="tel:+1234567890"
          className="group flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-body text-xs tracking-[0.15em] uppercase transition-all duration-500 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]"
        >
          <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
          Call Malar
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
