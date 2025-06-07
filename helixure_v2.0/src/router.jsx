// router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import LandingPage from "./components/LandingPage";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import ResultPage from "./components/ResultPage";
import Profile from "./components/Profile";
import Playground from "./components/Playground";
import Navbar from "./components/Navbar"; // optional

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App includes <Navbar /> and nested routes
    children: [
      { path: "", element: <LandingPage /> },
      { path: "signin", element: <Signin /> },
      { path: "signup", element: <Signup /> },
      { path: "result", element: <ResultPage /> },
      { path: "profile", element: <Profile /> },
      { path: "playground", element: <Playground /> },
    ],
  },
]);
