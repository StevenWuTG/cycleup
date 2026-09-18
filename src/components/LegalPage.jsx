import { SITE } from "../config/site";

// Shared building blocks for the Privacy Policy and Terms pages.

export function LegalPage({ title, children }) {
  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}>
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <p className="text-[#74c69d] text-sm font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-4xl lg:text-5xl font-bold text-white">
            {title}
          </h1>
          <p className="text-white/60 text-sm mt-3">Last updated {SITE.legalUpdated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
        <article className="bg-white rounded-3xl border border-[#e8e0d5] shadow-sm p-6 sm:p-10">
          {children}
        </article>
      </div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-xl sm:text-2xl font-bold text-[#1b4332] mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function P({ children }) {
  return <p className="text-[15px] leading-relaxed text-[#3f3a33]">{children}</p>;
}

export function List({ children }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-[15px] leading-relaxed text-[#3f3a33] marker:text-[#52b788]">
      {children}
    </ul>
  );
}

export function Callout({ title, children }) {
  return (
    <aside className="bg-[#f0faf3] border border-[#d8f3dc] rounded-2xl p-5 mb-10">
      <h2 className="text-sm font-bold text-[#2d6a4f] uppercase tracking-wide mb-2">{title}</h2>
      {children}
    </aside>
  );
}

export function EmailLink() {
  return (
    <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-[#2d6a4f] underline underline-offset-2 hover:text-[#1b4332]">
      {SITE.contactEmail}
    </a>
  );
}
