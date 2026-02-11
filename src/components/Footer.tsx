import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="section-padding border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">
          <Link to="/" className="font-serif text-2xl tracking-wide">
            Casa De Malar
          </Link>

          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
            Handcrafted bouquets for moments that matter.
          </p>
        </div>

        {/* Contact details */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
          <a
            href="https://instagram.com/casademalar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <Instagram className="w-4 h-4" />
            @casademalar
          </a>

          <a
            href="tel:+1234567890"
            className="flex items-center gap-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <Phone className="w-4 h-4" />
            +1 (234) 567-890
          </a>

          <div className="flex items-center gap-3 font-body text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            123 Blossom Lane, Florence, Italy
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/30 pt-6">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Casa De Malar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
