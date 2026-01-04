import Link from "next/link"; // Import Link

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />

      <div className="z-10 flex flex-col items-center text-center max-w-4xl space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="glass px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground/80 border border-white/10 shadow-lg mb-4">
          ✨ AI-Powered Role Calibration
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-transient">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
            Calibrate Your
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">
            Career Trajectory
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Stop guessing. Get a precise, data-driven diagnostic of your readiness for top-tier roles.
          Identify gaps, prioritize skills, and accelerate your path.
        </p>

        {/* CTA Area */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
          <Link href="/analyze">
            <button className="group relative px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold transition-all shadow-[0_0_0_0_rgba(99,102,241,0)] hover:shadow-[0_0_20px_0_rgba(99,102,241,0.5)] overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Analyze My Resume
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>

          <button className="px-8 py-4 glass hover:bg-white/5 text-white rounded-full font-medium transition-all hover:border-white/30">
            View Sample Report
          </button>
        </div>

        {/* Stats / Trust */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 text-center border-t border-white/5 pt-8 w-full max-w-2xl">
          <div>
            <div className="text-2xl font-bold text-white">Diagnostic</div>
            <div className="text-sm text-zinc-500">Not just a score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Actionable</div>
            <div className="text-sm text-zinc-500">Clear next steps</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-white">Private</div>
            <div className="text-sm text-zinc-500">Runs locally secure</div>
          </div>
        </div>
      </div>
    </main>
  );
}
