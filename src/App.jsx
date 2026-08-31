import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import PostItem from "./pages/PostItem";
import ItemDetail from "./pages/ItemDetail";
import { ListingsProvider } from "./context/ListingsContext";
import "./index.css";

export default function App() {
  return (
    <ListingsProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/post" element={<PostItem />} />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </BrowserRouter>
    </ListingsProvider>
  );
}
