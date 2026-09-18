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
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import { ListingsProvider } from "./context/ListingsContext";
import { MessagesProvider } from "./context/MessagesContext";
import "./index.css";

export default function App() {
  return (
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
              <Route path="/messages" element={<RequireAuth><Inbox /></RequireAuth>} />
              <Route path="/messages/new/:listingId" element={<RequireAuth><NewMessage /></RequireAuth>} />
              <Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
            </Routes>
          </BrowserRouter>
        </MessagesProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}
