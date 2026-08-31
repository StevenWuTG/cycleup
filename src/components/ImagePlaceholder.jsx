const placeholderGradients = [
  "from-emerald-200 to-teal-300",
  "from-amber-200 to-orange-300",
  "from-green-200 to-emerald-300",
  "from-lime-200 to-green-300",
  "from-teal-200 to-cyan-300",
  "from-yellow-200 to-amber-300",
  "from-orange-200 to-red-200",
];

export default function ImagePlaceholder({ title, id, className = "h-52" }) {
  const gradient = placeholderGradients[id % placeholderGradients.length];
  const initials = title.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <div className={`w-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white drop-shadow">
        {initials}
      </div>
    </div>
  );
}
