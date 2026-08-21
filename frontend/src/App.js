import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ScrollToTop from "./Components/ScrollToTop";

//admin
import AddSentence from "./Admin/AddSentence";
import AddTracingData from "./Admin/AddTracingData";

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
        <Route path="/" element={<Welcome lang={lang} />} />
        <Route path="/home" element={<Home lang={lang} setLang={setLang} />} />
        <Route path="/register" element={<Register lang={lang} />} />
        <Route path="/letter-recognition" element={<LetterRecognition />} />
        <Route path="/letter-tracing" element={<LetterTracing />} />
        <Route path="/gamified-learning" element={<GamifiedLearning lang={lang} />} />
        <Route path="/sentence" element={<Sentence lang={lang} />} />
        <Route path="/progress" element={<Progress lang={lang} />} />

        {/* Admin routes */}
        <Route path="/add-sentence" element={<AddSentence />} />
        <Route path="/add-tracing-data" element={<AddTracingData />} />
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