import { Link } from "react-router-dom";
import { Leaf, Recycle, ShoppingBag, Heart, ArrowRight, Star, TrendingUp, Package, Users } from "lucide-react";

const stats = [
  { icon: <Package size={20} />, value: "12,400+", label: "Items Upcycled" },
  { icon: <Users size={20} />,   value: "3,200+",  label: "Active Sellers" },
  { icon: <TrendingUp size={20} />, value: "18 tons", label: "Waste Diverted" },
  { icon: <Star size={20} />,    value: "4.9 / 5",  label: "Avg. Rating" },
];

const features = [
  {
    icon: <Recycle size={22} className="text-[#2d6a4f]" />,
    title: "Give Items New Life",
    desc: "Every purchase prevents landfill waste. Our makers transform discarded materials into beautiful, functional goods with a story.",
  },
  {
    icon: <ShoppingBag size={22} className="text-[#2d6a4f]" />,
    title: "Shop with Purpose",
    desc: "Browse hundreds of handcrafted upcycled items — furniture, fashion, art, home goods — from independent creators worldwide.",
  },
  {
    icon: <Heart size={22} className="text-[#2d6a4f]" />,
    title: "Support Local Makers",
    desc: "100% of proceeds go directly to artisans who pour their craft into sustainable, eco-conscious goods you can feel good about.",
  },
];

const testimonials = [
  { name: "Sarah K.", location: "Portland, OR", text: "Found the most beautiful reclaimed wood table. It arrived even better than pictured — the maker left a note about where the wood came from.", stars: 5 },
  { name: "Marcus T.", location: "Brooklyn, NY", text: "Sold three upcycled lamps in my first week. CycleUp connected me with buyers who actually care about sustainable craft.", stars: 5 },
  { name: "Priya N.", location: "Austin, TX", text: "Love knowing every purchase keeps something out of a landfill. I've redecorated my whole apartment through CycleUp.", stars: 5 },
];

const recentItems = [
  { title: "Reclaimed Wood Shelf", price: 45, cat: "Furniture", gradient: "from-amber-100 to-orange-200" },
  { title: "Denim Tote Bag",       price: 22, cat: "Fashion",   gradient: "from-blue-100 to-teal-200"   },
  { title: "Mason Jar Lamp",       price: 38, cat: "Lighting",  gradient: "from-yellow-100 to-amber-200" },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1f15] via-[#1b4332] to-[#2d6a4f]">
        {/* Background texture dots */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #74c69d 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-[#74c69d] mb-6">
                <Leaf size={13} />
                Sustainable Shopping, Reimagined
              </div>
              <h1
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
              >
                One Person's Trash Is{" "}
                <em className="not-italic text-[#74c69d]">Another's Treasure</em>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
                CycleUp connects makers who transform discarded materials into beautiful,
                sustainable goods — and the conscious shoppers who love them.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 bg-[#52b788] hover:bg-[#74c69d] text-[#0a1f15] font-bold px-7 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl text-base"
                >
                  Browse Marketplace
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to="/post"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-full transition-all text-base"
                >
                  Start Selling
                </Link>
              </div>
            </div>

            {/* Right: floating cards */}
            <div className="hidden lg:block relative h-80">
              {recentItems.map((item, i) => (
                <div
                  key={item.title}
                  className="absolute bg-white rounded-2xl shadow-xl overflow-hidden w-52"
                  style={{
                    top:  i === 0 ? "0"    : i === 1 ? "80px"  : "160px",
                    left: i === 0 ? "40px" : i === 1 ? "160px" : "60px",
                    transform: `rotate(${i === 0 ? "-3deg" : i === 1 ? "2deg" : "-1deg"})`,
                    zIndex: 3 - i,
                  }}
                >
                  <div className={`h-28 bg-gradient-to-br ${item.gradient}`} />
                  <div className="px-4 py-3">
                    <div className="font-semibold text-sm text-[#1a2e1e]">{item.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[#8d8073]">{item.cat}</span>
                      <span className="text-sm font-bold text-[#2d6a4f]">${item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Glow blob */}
              <div className="absolute inset-0 bg-[#52b788]/20 rounded-full blur-3xl scale-75" />
            </div>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" fill="#f8f4ed" />
          </svg>
        </div>
        <div className="h-10" />
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="bg-[#f8f4ed] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ icon, value, label }) => (
              <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e0d5] flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-[#2d6a4f]">
                  {icon}
                </div>
                <div className="text-2xl xl:text-3xl font-bold text-[#1b4332]">{value}</div>
                <div className="text-sm text-[#8d8073] font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why CycleUp ──────────────────────────────────── */}
      <section className="bg-[#f8f4ed] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#52b788] uppercase tracking-widest mb-3">Why CycleUp</p>
            <h2
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              className="text-4xl lg:text-5xl font-bold text-[#1b4332] mb-4"
            >
              Good for the planet.<br />Great for your home.
            </h2>
            <p className="text-[#6b7280] max-w-lg mx-auto text-base lg:text-lg">
              Sustainable doesn't mean sacrificing beauty. Every item here proves otherwise.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="relative bg-white rounded-3xl p-8 shadow-sm border border-[#e8e0d5] hover:shadow-md transition-shadow">
                <div className="absolute top-6 right-6 text-6xl font-black text-[#f0faf3] select-none leading-none">
                  {i + 1}
                </div>
                <div className="w-12 h-12 bg-[#d8f3dc] rounded-2xl flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1b4332] mb-2">{f.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="bg-[#1b4332] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#74c69d] uppercase tracking-widest mb-3">Community Love</p>
            <h2
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              className="text-4xl font-bold text-white"
            >
              Makers & shoppers agree
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/8 border border-white/15 rounded-3xl p-7 backdrop-blur-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-[#ffd166] fill-[#ffd166]" />
                  ))}
                </div>
                <p className="text-white/85 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2d6a4f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-[#74c69d] text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="bg-[#f8f4ed] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #74c69d 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <Leaf size={44} className="text-[#74c69d] mx-auto mb-4" />
              <h2
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                className="text-4xl lg:text-5xl font-bold text-white mb-4"
              >
                Ready to close the loop?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                Join thousands of eco-conscious makers and shoppers building a circular economy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 bg-[#52b788] hover:bg-[#74c69d] text-[#0a1f15] font-bold px-8 py-3.5 rounded-full transition-all shadow-lg text-base"
                >
                  Shop Now <ArrowRight size={17} />
                </Link>
                <Link
                  to="/post"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base"
                >
                  List Your Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-[#0a1f15] text-white/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Leaf size={15} className="text-[#52b788]" />
            CycleUp
          </div>
          <p>© {new Date().getFullYear()} CycleUp. Building a circular economy together.</p>
          <div className="flex gap-4 text-white/50">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
