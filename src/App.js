import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/layout/Navbar";
import Home from "./components/pages/Home";

import MovieDetail from "./components/movies/MovieDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/movie/:id" element={<MovieDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
