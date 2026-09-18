import { Component } from "react";
import { Leaf } from "lucide-react";
import { SITE } from "../config/site";

// Catches errors thrown while rendering so one bug shows a friendly message
// instead of a blank screen. It uses plain <a> links and a real page reload
// (not router Links) so it still works if the router itself is what broke.
// Changing `resetKey` (e.g. the current path) clears a previous error, so
// navigating away from a broken page recovers without a reload.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error in the app:", error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="min-h-[70vh] bg-[#f8f4ed] flex items-center justify-center px-4 py-20 text-center"
        style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}
        role="alert"
      >
        <div className="max-w-md">
          <Leaf size={44} className="text-[#d8f3dc] mx-auto mb-4" />
          <h1 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-3xl font-bold text-[#1b4332] mb-2">
            Something went wrong
          </h1>
          <p className="text-[#6b7280] mb-6">
            An unexpected error stopped this page from loading. Reloading usually fixes it. If it keeps happening, please
            email <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-[#2d6a4f] underline underline-offset-2">{SITE.contactEmail}</a>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button" onClick={() => window.location.reload()}
              className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Reload the page
            </button>
            <a href="/marketplace" className="font-semibold text-[#2d6a4f] hover:underline px-6 py-3">
              Go to the marketplace
            </a>
          </div>
        </div>
      </div>
    );
  }
}
