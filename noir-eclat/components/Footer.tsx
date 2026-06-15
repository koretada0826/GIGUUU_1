"use client";

const COLS: { title: string; links: string[] }[] = [
  { title: "Maison", links: ["Collection", "Craft", "The Atelier"] },
  { title: "Visit", links: ["Private Preview", "Contact", "Appointments"] },
  { title: "Follow", links: ["Instagram", "Journal", "Newsletter"] },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative border-t border-platinum/10 px-6 py-20 md:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <h2 className="display text-gold-foil text-[clamp(2rem,5vw,3.4rem)] tracking-[0.08em]">
              NOIR ÉCLAT
            </h2>
            <p className="mt-5 max-w-xs text-xs font-light leading-relaxed tracking-[0.18em] text-smoke">
              Jewelry in the dark. Light becomes form.
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} className="md:col-span-2">
              <h3 className="eyebrow mb-5">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="group relative inline-block text-sm font-light text-smoke transition-colors duration-500 hover:text-diamond"
                    >
                      {l}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold/70 transition-all duration-500 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-platinum/10 pt-8 text-[0.62rem] uppercase tracking-[0.28em] text-smoke/70 md:flex-row md:items-center">
          <span>© 2026 NOIR ÉCLAT — Private Jewelry Maison</span>
          <span className="flex gap-6">
            <a href="#" className="transition-colors hover:text-platinum">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-platinum">
              Privacy
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
