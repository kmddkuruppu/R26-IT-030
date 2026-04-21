import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";

//Pages
import Home from "./Pages/Home";
import LetterRecognition from "./Pages/LetterRecognition";

function AppRoutes() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/letter-recognition" element={<LetterRecognition />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default AppRoutes;