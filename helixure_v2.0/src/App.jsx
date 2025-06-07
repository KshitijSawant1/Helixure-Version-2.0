// App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => (
  <>
    <Navbar />
    <Outlet />
    <ToastContainer position="top-right" autoClose={2000} />
  </>
);

export default App;
