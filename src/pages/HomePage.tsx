import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PortfolioPreviewSection from "@/components/PortfolioPreviewSection";
import CraftSection from "@/components/CraftSection";
import WriteReviewSection from "@/components/WriteReviewSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const HomePage = () => {
  return (
    <div className="relative">
      <div className="grain-overlay" />
      <Navbar />
      <HeroSection />

      {/* Smooth gradient bridge from hero → content */}
      <div className="relative z-10 -mt-[1px]">
        <div className="h-16 md:h-24 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
      </div>

      <HowItWorksSection />
      <PortfolioPreviewSection />
      <CraftSection />
      <WriteReviewSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
