import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: number;
  name: string;
  title: string;
  story: string;
  created_at: string;
}

// Placeholder data — Supabase-ready structure
const reviews: Review[] = [
  {
    id: 1,
    name: "Ananya R.",
    title: "The Night I Said Sorry",
    story: "I didn't know how to apologise. Malar created something that said everything I couldn't. When she opened the door, she cried before I could speak.",
    created_at: "2025-12-15",
  },
  {
    id: 2,
    name: "James K.",
    title: "A Proposal She Didn't Expect",
    story: "I told Malar about our first date — a rainy afternoon at a café. The bouquet smelled like that day. She said yes before I finished the question.",
    created_at: "2026-01-20",
  },
  {
    id: 3,
    name: "Priya M.",
    title: "For My Mother, Miles Away",
    story: "My mother lives across the ocean. Malar arranged jasmine and marigold — flowers from our garden at home. Amma said it felt like I was standing beside her.",
    created_at: "2026-02-01",
  },
  {
    id: 4,
    name: "David L.",
    title: "Birthday Morning Surprise",
    story: "Waking up to a Casa De Malar arrangement changed her entire day. She carried one flower in her hair for a week.",
    created_at: "2025-11-10",
  },
  {
    id: 5,
    name: "Sofia T.",
    title: "Healing After Loss",
    story: "Malar listened when I couldn't find words. The arrangement she created felt like a gentle hug in a vase.",
    created_at: "2025-10-05",
  },
];

const latestReviews = [...reviews]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 3);

const remainingReviews = reviews.filter((r) => !latestReviews.find((lr) => lr.id === r.id));

const ReviewsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  return (
    <section id="reviews" className="section-padding max-w-7xl mx-auto">
      {/* Top row — buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-wrap gap-4 mb-12"
      >
        <button
          onClick={() => document.querySelector("#reviews")?.scrollIntoView({ behavior: "smooth" })}
          className="btn-outline"
        >
          See Reviews
        </button>
        <button
          onClick={() => document.querySelector("#craft")?.scrollIntoView({ behavior: "smooth" })}
          className="btn-primary"
        >
          Book Bouquet
        </button>
      </motion.div>

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
              "{review.story}"
            </p>
            <div>
              <p className="font-body text-sm font-bold">{review.name}</p>
              <p className="font-body text-xs text-muted-foreground tracking-wide">{review.title}</p>
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
              <button onClick={() => scroll("left")} className="p-2 rounded-full border border-border/50 hover:bg-card transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll("right")} className="p-2 rounded-full border border-border/50 hover:bg-card transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {remainingReviews.map((review) => (
              <div
                key={review.id}
                className="min-w-[300px] max-w-[320px] bg-card rounded-3xl p-8 shadow-[var(--card-shadow)] border border-border/50 flex-shrink-0"
              >
                <p className="font-serif text-lg italic mb-4 leading-relaxed">
                  "{review.story}"
                </p>
                <p className="font-body text-sm font-bold">{review.name}</p>
                <p className="font-body text-xs text-muted-foreground">{review.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
