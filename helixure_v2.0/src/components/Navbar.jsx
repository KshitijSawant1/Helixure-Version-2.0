import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/AuthContext"; // 👈 Add this
import helixurev2logo from "../assets/logos/hv2.png";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { session, signOut } = useUserAuth(); // 👈 Get user session and signOut
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  const navLinksLoggedOut = [
    { label: "signup", path: "/signup" },
    { label: "signin", path: "/signin" },
    { label: "Result Page", path: "/result" },
  ];

  const navLinksLoggedIn = [
    { label: "playground", path: "/playground" },
    { label: "Result Page", path: "/result" },
    { label: "profile", path: "/profile" },
    { label: "whiteboard", path: "/whiteboard" },
  ];

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch failed:", error.message);
        return;
      }

      const requiredFields = [
        "firstname",
        "lastname",
        "dob",
        "phone",
        "company",
        "designation",
        "email",
        "tagline",
        "bio",
        "avatarUrl",
      ];
      const complete = requiredFields.every(
        (field) => data[field] && data[field].toString().trim() !== ""
      );

      setIsProfileComplete(complete);
    };

    checkProfile();
  }, [session]);
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img src={helixurev2logo} className="h-10" alt="Refynix Logo" />
        </Link>

        {/* Right Side Buttons */}
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            type="button"
            onClick={() => {
              if (isProfileComplete) {
                navigate("/playground");
              } else {
                toast.error(
                  "Please complete your profile before accessing Playground."
                );
              }
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Proceed to Playground
          </button>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-cta"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {(session?.user ? navLinksLoggedIn : navLinksLoggedOut).map(
              ({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                  >
                    {label}
                  </Link>
                </li>
              )
            )}
            {session?.user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                >
                  logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
