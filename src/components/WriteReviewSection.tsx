import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { addReview } from "@/lib/supabase";

const WriteReviewSection = () => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [experience, setExperience] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || !experience.trim()) return;
    
    setSubmitting(true);
    try {
      await addReview(name, "", rating, experience);
      setSubmitted(true);
      // Reset form
      setName("");
      setRating(0);
      setExperience("");
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-padding max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9 }}
      >
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">
          Share Your Story
        </p>
        <h2 className="font-serif text-3xl md:text-5xl leading-snug mb-10 text-center">
          Write a <span className="italic">Review</span>
        </h2>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-10 shadow-[var(--card-shadow)] border border-border/50 text-center"
          >
            <p className="font-serif text-2xl mb-2">Thank you, {name}.</p>
            <p className="font-body text-muted-foreground">Your story means the world to us.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 md:p-10 shadow-[var(--card-shadow)] border border-border/50 space-y-6">
            {/* Name */}
            <div>
              <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="Enter your name"
                className="w-full bg-transparent border-b border-border/50 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Star Rating */}
            <div>
              <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                Your Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform duration-200 hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors duration-200 ${
                        star <= (hoverRating || rating)
                          ? "fill-primary text-primary"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Your Experience
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Tell us about your moment..."
                className="w-full bg-transparent border-b border-border/50 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || rating === 0 || !experience.trim() || submitting}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default WriteReviewSection;