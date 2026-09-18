import { Leaf } from "lucide-react";

const fontStyle = { fontFamily: "'Inter Variable', system-ui, sans-serif" };

// The centred white card used by the sign-in, recovery and confirmation pages.
export function AuthCard({ icon, title, subtitle, children }) {
  return (
    <div className="min-h-[70vh] bg-[#f8f4ed] flex items-center justify-center px-4 py-12" style={fontStyle}>
      <div className="bg-white rounded-3xl shadow-lg border border-[#e8e0d5] p-8 sm:p-10 max-w-md w-full">
        <div className="w-12 h-12 bg-[#d8f3dc] rounded-2xl flex items-center justify-center mb-5 text-[#2d6a4f]">
          {icon ?? <Leaf size={22} />}
        </div>
        <h1 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-3xl font-bold text-[#1b4332] mb-1">
          {title}
        </h1>
        {subtitle && <p className="text-[#6b7280] text-sm mb-6">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  );
}

export function TextField({ id, label, type = "text", value, onChange, error, autoComplete, placeholder, autoFocus }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#1a2e1e] mb-2">{label}</label>
      <input
        id={id} name={id} type={type} value={value} onChange={onChange}
        autoComplete={autoComplete} placeholder={placeholder} autoFocus={autoFocus}
        aria-invalid={error ? "true" : undefined} aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] transition bg-white text-[#1a2e1e] placeholder:text-[#c4a882] ${
          error ? "border-red-400 bg-red-50" : "border-[#ddd6cc] hover:border-[#a0785a]"
        }`}
      />
      {error && <p id={`${id}-error`} role="alert" className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <p role="alert" className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{children}</p>;
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
    >
      {children}
    </button>
  );
}
