import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const navItems = [
  { label: "Our Story", href: "#how-it-works" },
  { label: "Previous Work", href: "/previous-work" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#craft" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
        scrolled
          ? "backdrop-blur-md bg-background/80 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4 md:py-5">
        <Link to="/" className="font-serif text-2xl md:text-3xl tracking-wide text-foreground">
          Casa De Malar
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navItems.map((item) =>
              item.href.startsWith("/") ? (
                <li key={item.label}>
                  <Link to={item.href} className="nav-link font-body text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <button
                    onClick={() => handleClick(item.href)}
                    className="nav-link font-body text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
                  >
                    {item.label}
                  </button>
                </li>
              )
            )}
          </ul>

          <a
            href="tel:+1234567890"
            className="btn-primary flex items-center gap-2 py-2 px-6 text-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            Call Malar
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
