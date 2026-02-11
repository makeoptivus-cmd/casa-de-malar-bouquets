import { motion } from "framer-motion";

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
    <section id="how-it-works" className="section-padding max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-snug mb-8">
            Every bouquet tells
            <br />
            <span className="italic">a story</span>
          </h2>

          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5">
                <span className="font-serif text-3xl text-primary/40">{step.number}</span>
                <div>
                  <h3 className="font-serif text-xl mb-1">{step.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — floating cards */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="bg-card rounded-3xl p-8 shadow-[var(--card-shadow)] border border-border/50"
            >
              <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                Step {step.number}
              </p>
              <h4 className="font-serif text-lg mb-2">{step.title}</h4>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
