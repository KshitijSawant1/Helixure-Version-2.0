import bgImage from "../assets/images/ssuibg.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import React, { useContext, useState } from "react";
import { useUserAuth } from "../context/AuthContext";
const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const { session, signInUser } = useUserAuth();
  console.log(session);
  const navigate = useNavigate();
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInUser(email.trim(), password.trim());

      if (result.success) {
        navigate("/profile");
      } else {
        setError(result.error || "Sign-in failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      navigate("/playground");
    }
  }, [session]);

  return (
    <div className="flex w-full h-screen">
      {/* Left: Form Section */}
      <div
        className="w-full flex flex-col justify-center items-center gap-6 px-10 lg:w-1/2"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #e9d5ff, #bfdbfe)",
        }}
      >
        <div className="w-full max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Signin Form
            </h1>
            <p className="text-gray-500 mt-2 dark:text-gray-400">
              Please enter your details
            </p>
          </div>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {/* Username Input */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <span className="px-3 text-gray-500 dark:text-gray-300">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  id="email"
                  placeholder="john.doe@company.com"
                  required
                  className="w-full p-3 text-sm border-l border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <span className="px-3 text-gray-500 dark:text-gray-300">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="•••••••••"
                  required
                  className="w-full p-3 text-sm border-l border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Checkbox and Forgot */}
            <div className="flex items-center justify-between text-sm ">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Lost Password?
              </a>
            </div>

            {/* Signin Button */}
            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-gray-300 dark:border-gray-600" />

          {/* Social Login Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center w-full mt-4">
            {/* Facebook */}
            <button
              type="button"
              className="flex-1 min-w-[140px] text-[#3b5998] bg-white border border-[#3b5998] hover:bg-[#3b5998] hover:text-white focus:ring-4 focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 8 19"
              >
                <path d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" />
              </svg>
              Facebook
            </button>

            {/* GitHub */}
            <button
              type="button"
              className="flex-1 min-w-[140px] text-[#24292F] bg-white border border-[#24292F] hover:bg-[#24292F] hover:text-white focus:ring-4 focus:ring-gray-600 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" />
              </svg>
              GitHub
            </button>

            {/* Google */}
            <button
              type="button"
              className="flex-1 min-w-[140px] text-[#4285F4] bg-white border border-[#4285F4] hover:bg-[#4285F4] hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 18 19"
              >
                <path d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" />
              </svg>
              Google
            </button>
          </div>
          <div className="my-6 border-t border-gray-300 dark:border-gray-600" />

          <div className="text-sm text-center text-gray-600 dark:text-gray-300 mt-4">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <div
        className="hidden relative lg:flex h-full w-1/2 items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className="w-60 h-60 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-[20%]"
          style={{
            animation: "spin 5s linear infinite",
          }}
        />

        <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg" />
      </div>
    </div>
  );
};

export default Signin;
