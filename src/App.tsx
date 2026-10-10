import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import CarDetail from "./pages/CarDetail";
import Compare from "./pages/Compare";
import LoanCalcPage from "./pages/LoanCalcPage";
import Favorites from "./pages/Favorites";
import ComingSoon from "./pages/ComingSoon";
import { Header, Footer } from "./components/layout";
import CompareBar from "./components/CompareBar";
import { Preloader, CustomCursor } from "./components/fx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem("aurum-seen"));

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  const done = () => {
    sessionStorage.setItem("aurum-seen", "1");
    setLoading(false);
  };

  return (
    <>
      <CustomCursor />
      <AnimatePresence>{loading && <Preloader onDone={done} />}</AnimatePresence>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Catalog />} />
          <Route path="/cars/:slug" element={<CarDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/loan-calculator" element={<LoanCalcPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/test-drive" element={<ComingSoon title="Đặt lịch lái thử" />} />
          <Route path="/contact" element={<ComingSoon title="Liên hệ" />} />
          <Route path="/auth/login" element={<ComingSoon title="Đăng nhập" />} />
          <Route path="*" element={<ComingSoon title="Không tìm thấy" />} />
        </Routes>
      </main>
      <CompareBar />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
