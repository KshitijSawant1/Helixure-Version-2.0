import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import ResultPage from "./components/ResultPage";
import Profile from "./components/Profile";
import Playground from "./components/Playground";
import Navbar from "./components/Navbar";

const App = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/playground" element={<Playground />} />
    </Routes>
  </>
);

export default App;
