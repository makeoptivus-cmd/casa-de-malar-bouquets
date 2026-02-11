import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PortfolioPreviewSection from "@/components/PortfolioPreviewSection";
import CraftSection from "@/components/CraftSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const HomePage = () => {
  return (
    <div className="relative">
      <div className="grain-overlay" />
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <PortfolioPreviewSection />
      <CraftSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
