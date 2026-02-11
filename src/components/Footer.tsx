import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="section-padding border-t border-border/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="font-serif text-2xl tracking-wide">
          Casa De Malar
        </Link>

        <p className="font-body text-xs text-muted-foreground tracking-wider">
          Handcrafted bouquets for moments that matter.
        </p>

        <p className="font-body text-xs text-muted-foreground">
          © {new Date().getFullYear()} Casa De Malar
        </p>
      </div>
    </footer>
  );
};

export default Footer;
