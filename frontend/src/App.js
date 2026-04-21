import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";

//Pages
import Home from "./Pages/Home";
import LetterRecognition from "./Pages/LetterRecognition";
import LetterTracing from "./Pages/LetterTracing";  


function AppRoutes() {
  const [lang, setLang] = useState("en"); // ✅ state lives here

  return (
    <Router>
      <Header lang={lang} setLang={setLang} /> {/* ✅ pass down */}
      <Routes>
        <Route path="/" element={<Home lang={lang} setLang={setLang} />} />
        <Route path="/letter-recognition" element={<LetterRecognition />} />
        <Route path="/letter-tracing" element={<LetterTracing />} />
      </Routes>
      <Footer lang={lang} /> {/* ✅ Footer only needs lang, not setLang */}
    </Router>
  );
}

export default AppRoutes;