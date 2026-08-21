import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Profile from "./Components/Profile";
import ScrollToTop from "./Components/ScrollToTop";
import ProtectedRoute from "./Components/ProtectedRoute";

//admin
import AddSentence from "./Admin/AddSentence";

// Pages
import Welcome from "./Pages/Welcome";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import LetterRecognition from "./Pages/LetterRecognition";
import LetterTracing from "./Pages/LetterTracing";
import GamifiedLearning from "./Pages/GamifiedLearning";
import Sentence from "./Pages/Sentence";
import Progress from "./Pages/Progress";

function AppLayout() {
  const [lang, setLang] = useState("en");
  const location = useLocation();

  // Header/Footer hide කරන pages
  const hideLayout =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      <ScrollToTop />

      {!hideLayout && <Header lang={lang} setLang={setLang} />}

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<Welcome lang={lang} />} />
        <Route path="/register" element={<Register lang={lang} />} />


      </Routes>

      {!hideLayout && <Footer lang={lang} />}
    </>
  );
}

// Router wrapper
function AppRoutes() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default AppRoutes;