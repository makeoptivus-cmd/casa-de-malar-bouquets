import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin, Clock3 } from "lucide-react";
import BotanicalLeaves from "@/components/BotanicalLeaves";

const Footer = () => {
  return (
    <footer className="relative section-padding bg-black text-white border-t border-white/10 overflow-hidden">
      <BotanicalLeaves pattern={6} />
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">
          <Link to="/" className="font-serif text-2xl tracking-wide text-white">
            Casa De Malar
          </Link>

          <p className="font-body text-sm text-white/70 leading-relaxed max-w-xs">
            Handcrafted bouquets for moments that matter.
          </p>
        </div>

        {/* Contact details */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
          <a
            href="https://instagram.com/casademalar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 font-body text-sm text-white/70 hover:text-white transition-colors duration-300"
          >
            <Instagram className="w-4 h-4" />
            @casademalar
          </a>

          <a
            href="tel:8825586566"
            className="flex items-center gap-3 font-body text-sm text-white/70 hover:text-white transition-colors duration-300"
          >
            <Phone className="w-4 h-4" />
            88255 86566
          </a>

          <div className="flex items-center gap-3 font-body text-sm text-white/70">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            GST Rd, Pillayar Koil St, near Srm university, Chengalpattu, Tamil Nadu 603203
          </div>

          <div className="flex items-center gap-3 font-body text-sm text-white/70">
            <Clock3 className="w-4 h-4 flex-shrink-0" />
            Shop Timing: 24/7
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/15 pt-6">
          <p className="font-body text-xs text-white/60">
            © {new Date().getFullYear()} Casa De Malar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
