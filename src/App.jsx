import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireAuth from "./components/RequireAuth";
import Landing from "./pages/Landing";
import { AuthProvider } from "./context/AuthContext";
import { ListingsProvider } from "./context/ListingsContext";
import { MessagesProvider } from "./context/MessagesContext";
import { LocationProvider } from "./context/LocationContext";
import "./index.css";

// Every page except the landing page is loaded on demand, so a first-time
// visitor doesn't download the code for pages they may never open.
const Marketplace  = lazy(() => import("./pages/Marketplace"));
const ItemDetail   = lazy(() => import("./pages/ItemDetail"));
const PostItem     = lazy(() => import("./pages/PostItem"));
const EditItem     = lazy(() => import("./pages/EditItem"));
const Auth         = lazy(() => import("./pages/Auth"));
const Inbox        = lazy(() => import("./pages/Inbox"));
const Conversation = lazy(() => import("./pages/Conversation"));
const NewMessage   = lazy(() => import("./pages/NewMessage"));
const Privacy      = lazy(() => import("./pages/Privacy"));
const Terms        = lazy(() => import("./pages/Terms"));
const NotFound     = lazy(() => import("./pages/NotFound"));
const MyProfile    = lazy(() => import("./pages/Profile").then(m => ({ default: m.MyProfile })));
const UserProfile  = lazy(() => import("./pages/Profile").then(m => ({ default: m.UserProfile })));

function PageLoading() {
  return (
    <div
      className="min-h-[70vh] bg-[#f8f4ed] flex items-center justify-center text-sm text-[#8d8073]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      role="status"
    >
      Loading…
    </div>
  );
}

// The routes live in their own component so the error boundary can reset itself
// whenever the path changes, while the navbar and footer stay put around it.
function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/post" element={<RequireAuth><PostItem /></RequireAuth>} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/item/:id/edit" element={<RequireAuth><EditItem /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><MyProfile /></RequireAuth>} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/messages" element={<RequireAuth><Inbox /></RequireAuth>} />
          <Route path="/messages/new/:listingId" element={<RequireAuth><NewMessage /></RequireAuth>} />
          <Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <AuthProvider>
        <ListingsProvider>
          <MessagesProvider>
            <BrowserRouter>
              <Navbar />
              <AppRoutes />
              <Footer />
            </BrowserRouter>
          </MessagesProvider>
        </ListingsProvider>
      </AuthProvider>
    </LocationProvider>
  );
}
