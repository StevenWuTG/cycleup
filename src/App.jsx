import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import PostItem from "./pages/PostItem";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/post" element={<PostItem />} />
      </Routes>
    </BrowserRouter>
  );
}
