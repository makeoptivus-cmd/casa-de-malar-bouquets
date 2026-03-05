const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <img
        src="/images/transformer-sequence/1.jpg"
        alt="Bouquet hero"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/15" />

      <div className="relative z-10 flex min-h-screen items-end pb-16 sm:pb-20 md:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-10 lg:px-16">
          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white sm:text-xs">
            Casa De Malar
          </p>
          <h1 className="max-w-4xl font-serif text-4xl leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Not just flowers.
            <br />
            <span className="italic text-white">Moments that stay.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white sm:text-base md:text-lg">
            Handcrafted bouquets designed around your story.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full border border-white/80 bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black shadow-[0_10px_26px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] sm:px-8"
            >
              Tell Us Your Story
            </button>

            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-black sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-black" aria-hidden="true" />
              Delivery available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
