import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import PostItem from "./pages/PostItem";
import ItemDetail from "./pages/ItemDetail";
import EditItem from "./pages/EditItem";
import Auth from "./pages/Auth";
import Inbox from "./pages/Inbox";
import Conversation from "./pages/Conversation";
import NewMessage from "./pages/NewMessage";
import { MyProfile, UserProfile } from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import { ListingsProvider } from "./context/ListingsContext";
import { MessagesProvider } from "./context/MessagesContext";
import { LocationProvider } from "./context/LocationContext";
import "./index.css";

export default function App() {
  return (
    <LocationProvider>
      <AuthProvider>
        <ListingsProvider>
          <MessagesProvider>
            <BrowserRouter>
              <Navbar />
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
              </Routes>
            <Footer />
            </BrowserRouter>
          </MessagesProvider>
        </ListingsProvider>
      </AuthProvider>
    </LocationProvider>
  );
}
