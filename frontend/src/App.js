import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";

//Pages
import Home from "./Pages/Home";
import LetterRecognition from "./Pages/LetterRecognition";
import LetterTracing from "./Pages/LetterTracing";  
import GamifiedLearning from "./Pages/GamifiedLearning";
import PracticeSentencesAndProgressPage from "./Pages/PracticeSentenceAndProgress";
import Progress from "./Pages/Progress";


function AppRoutes() {
  const [lang, setLang] = useState("en"); // ✅ state lives here

  return (
    <Router>
      <Header lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<Home lang={lang} setLang={setLang} />} />
        <Route path="/letter-recognition" element={<LetterRecognition />} />
        <Route path="/letter-tracing" element={<LetterTracing />} />
        <Route path="/gamified-learning" element={<GamifiedLearning lang={lang} />} />
        <Route path="/practice-sentences" element={<PracticeSentencesAndProgressPage lang={lang} />} />
        <Route path="/progress" element={<Progress lang={lang} />} />
      </Routes>
      <Footer lang={lang} /> 
    </Router>
  );
}

export default AppRoutes;