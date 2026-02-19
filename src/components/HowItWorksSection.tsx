import { motion } from "framer-motion";
import BotanicalLeaves from "@/components/BotanicalLeaves";

const steps = [
  {
    number: "01",
    title: "Tell Us Your Moment",
    description: "Share the emotion, the occasion, the person. Every bouquet begins with a feeling.",
  },
  {
    number: "02",
    title: "We Design Emotionally",
    description: "Malar crafts each arrangement to carry the weight and warmth of your story.",
  },
  {
    number: "03",
    title: "You Deliver Meaning",
    description: "A bouquet arrives — not just beautiful, but deeply personal and unforgettable.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative z-10 bg-background section-padding overflow-hidden">
      <BotanicalLeaves pattern={1} />

      <div className="relative max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="mb-20">

          <div className="line-accent mb-6" />
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.1]">
            Every bouquet tells
            <br />
            <span className="italic">a story</span>
          </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.15 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className="group relative bg-card rounded-2xl p-8 md:p-10 shadow-[var(--card-shadow)] border border-border/40 hover:border-primary/20 transition-colors duration-500"
          >
            <span className="font-serif text-6xl text-primary/15 absolute top-6 right-8">
              {step.number}
            </span>
            <div className="relative">
              <h4 className="font-serif text-xl md:text-2xl mb-3">{step.title}</h4>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
