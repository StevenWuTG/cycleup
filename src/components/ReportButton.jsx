import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Flag, X } from "lucide-react";
import { reportReasons } from "../data/reportReasons";
import { submitReport } from "../lib/reports";
import { useAuth } from "../context/auth-context";

const MAX_DETAILS = 1000;

function ReportDialog({ heading, target, onClose }) {
  const [reason, setReason]   = useState("");
  const [details, setDetails] = useState("");
  const [error, setError]     = useState("");
  const [status, setStatus]   = useState("form"); // form | sending | done
  const firstRadio = useRef(null);

  // Focus the first option once, when the dialog opens.
  useEffect(() => { firstRadio.current?.focus(); }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) { setError("Choose a reason first."); return; }
    setStatus("sending");
    setError("");
    try {
      await submitReport({ reason, details, ...target });
      setStatus("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("form");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="report-title"
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 id="report-title" style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-2xl font-bold text-[#1b4332]">
            {status === "done" ? "Thanks for telling us" : heading}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#8d8073] hover:text-[#1a2e1e] p-1 -m-1">
            <X size={20} />
          </button>
        </div>

        {status === "done" ? (
          <div className="text-center py-2">
            <CheckCircle size={40} className="text-[#52b788] mx-auto mb-3" />
            <p className="text-[#6b7280] mb-6">
              We've received your report and we'll take a look. We won't tell the other person who reported them.
            </p>
            <button
              type="button" onClick={onClose}
              className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <fieldset>
              <legend className="text-sm font-semibold text-[#1a2e1e] mb-2">What's wrong?</legend>
              <div className="space-y-2">
                {reportReasons.map((r, i) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-sm cursor-pointer transition-colors ${
                      reason === r.value ? "border-[#52b788] bg-[#f0faf3]" : "border-[#ddd6cc] hover:border-[#a0785a]"
                    }`}
                  >
                    <input
                      ref={i === 0 ? firstRadio : undefined}
                      type="radio" name="reason" value={r.value} checked={reason === r.value}
                      onChange={() => { setReason(r.value); setError(""); }}
                      className="accent-[#2d6a4f]"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="report-details" className="block text-sm font-semibold text-[#1a2e1e] mb-2">
                Anything else we should know? <span className="font-normal text-[#a0785a]">(optional)</span>
              </label>
              <textarea
                id="report-details" value={details} onChange={e => setDetails(e.target.value)}
                rows={3} maxLength={MAX_DETAILS}
                className="w-full border border-[#ddd6cc] hover:border-[#a0785a] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#52b788] text-[#1a2e1e]"
              />
              <p className="text-xs text-[#a0785a] mt-1 text-right">{details.length} / {MAX_DETAILS}</p>
            </div>

            {error && <p role="alert" className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button" onClick={onClose}
                className="flex-1 border border-[#ddd6cc] hover:bg-[#faf6f0] text-[#6b7280] font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={status === "sending"}
                className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {status === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// A small "Report" control. `target` is exactly one of { listingId }, { userId }
// or { conversationId }. Signed-out visitors are sent to sign in first.
export default function ReportButton({ label = "Report", heading = "Report this", target, className = "" }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);

  const base = `inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${className}`;

  if (!user) {
    return (
      <Link to="/login" state={{ from: pathname }} className={base}>
        <Flag size={13} />
        Sign in to report
      </Link>
    );
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <>
      <button ref={trigger} type="button" onClick={() => setOpen(true)} className={base}>
        <Flag size={13} />
        {label}
      </button>
      {open && <ReportDialog heading={heading} target={target} onClose={close} />}
    </>
  );
}
