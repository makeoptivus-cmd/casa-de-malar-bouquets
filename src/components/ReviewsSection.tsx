import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getReviews, Review } from "@/lib/supabase";

const ReviewsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  const latestReviews = reviews.slice(0, 3);
  const remainingReviews = reviews.slice(3);

  return (
    <section id="reviews" className="section-padding max-w-7xl mx-auto">
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews yet. Be the first to share your story!</p>
        </div>
      ) : (
        <>
          {/* Latest 3 reviews */}
          <div className="space-y-8 mb-16">
            {latestReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="bg-card rounded-3xl p-8 md:p-10 shadow-[var(--card-shadow)] border border-border/50"
              >
                <p className="font-serif text-xl md:text-2xl italic mb-4 leading-relaxed">
                  "{review.message}"
                </p>
                <div>
                  <p className="font-body text-sm font-bold">{review.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          i < review.rating ? "bg-primary" : "bg-border/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Remaining reviews — horizontal scroll */}
          {remainingReviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">
                  More Stories
                </p>
                <div className="flex gap-2">
                  <button onClick={() => scroll("left")} title="Scroll left" className="p-2 rounded-full border border-border/50 hover:bg-card transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scroll("right")} title="Scroll right" className="p-2 rounded-full border border-border/50 hover:bg-card transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {remainingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="min-w-[300px] max-w-[320px] bg-card rounded-3xl p-8 shadow-[var(--card-shadow)] border border-border/50 flex-shrink-0"
                  >
                    <p className="font-serif text-lg italic mb-4 leading-relaxed">
                      "{review.message}"
                    </p>
                    <p className="font-body text-sm font-bold">{review.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < review.rating ? "bg-primary" : "bg-border/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ReviewsSection;
