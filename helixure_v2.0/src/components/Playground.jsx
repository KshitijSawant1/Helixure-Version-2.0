import React, { useEffect, useState } from "react";
import { FaBars, FaTh, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import testimage from "../assets/testimage.png";
import NewSpaceModal from "./NewSpaceModal";
import { supabase } from "../supabaseClient";
import { useLocation, useNavigate, Link } from "react-router-dom";

const Playground = () => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [view, setView] = useState("grid");
  const [showModal, setShowModal] = useState(false);

  const [filter, setFilter] = useState("All");
  const filteredCards = cards.filter((card) => {
    if (filter === "All") return true;
    if (filter === "Private") return card.type === "Private";
    if (filter === "Shared") return card.type === "Shared";
  });

  const location = useLocation();
  const navigate = useNavigate();
  const handleOpenWhiteboard = (spaceId) => {
    navigate("/whiteboard", {
      state: {
        spaceId: spaceId, // Pass the spaceId of the selected space
      },
    });
  };

  const handleExploreClick = (id) => {
    navigate("/whiteboard", {
      state: {
        spaceId: id,
      },
    });
  };

  const fetchSpaces = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("playground")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching spaces");
      setLoading(false);
      return;
    }

    const resolved = data.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      type: card.type,
      to: "#",
      image: testimage,
      colors: [card.color1, card.color2],
    }));

    setCards(resolved);
    setLoading(false);
  };
  useEffect(() => {
    fetchSpaces();
  }, []);

  return (
    <>
      <section className="relative w-full min-h-screen flex flex-col items-center pt-20  bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-900">
        {/* Title Section */}

        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            My{" "}
            <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">
              Playground
            </span>
          </h1>
        </div>

        {/* Filters + Controls */}
        <div className="w-full max-w-6xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm px-6 py-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {["Private", "Shared", "All"].map((label) => (
                <button
                  key={label}
                  onClick={() => setFilter(label)}
                  className="border border-gray-300 dark:border-gray-600 px-4 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
              {/* Create Button */}
              <button
                onClick={() => setShowModal(true)}
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Create a new space
                </span>
              </button>

              {/* View Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`px-4 py-2 flex items-center gap-1 ${
                    view === "list"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {view === "list" && <FaCheck className="text-sm" />}
                  <FaBars className="text-sm" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`px-4 py-2 flex items-center gap-1 ${
                    view === "grid"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {view === "grid" && <FaCheck className="text-sm" />}
                  <FaTh className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <NewSpaceModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            fetchSpaces();
          }}
        />
        {loading ? (
          <div
            className="flex flex-col justify-center items-center py-16"
            role="status"
          >
            <svg
              aria-hidden="true"
              className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Loading spaces...
            </span>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5 w-full max-w-6xl place-items-center">
                {filteredCards.map((card, index) => (
                  <div
                    key={index}
                    className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700"
                  >
                    {/* Gradient Header */}
                    <div
                      className={`w-full h-40 bg-gradient-to-r ${
                        card.colors?.[0] || "from-blue-500"
                      } ${card.colors?.[1] || "to-pink-500"}`}
                    />

                    {/* Badge */}
                    <div className="px-5 pt-4">
                      <span
                        className={`text-xs font-medium inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm border
    ${
      card.type === "Private"
        ? "bg-red-100 text-red-800 border-red-400 dark:bg-gray-700 dark:text-red-400"
        : "bg-blue-100 text-blue-800 border-blue-400 dark:bg-gray-700 dark:text-blue-400"
    }
  `}
                      >
                        {/* ICON */}
                        {card.type === "Private" ? (
                          <svg
                            className="w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="m7.4 3.736 3.43 3.429A5.046 5.046 0 0 1 12.133 7c.356.01.71.06 1.056.147l3.41-3.412a2.32 2.32 0 0 1 .451-.344A9.89 9.89 0 0 0 12.268 2a10.022 10.022 0 0 0-5.322 1.392c.165.095.318.211.454.344Zm11.451 1.54-.127-.127a.5.5 0 0 0-.706 0l-2.932 2.932c.03.023.05.054.078.077.237.194.454.41.651.645.033.038.077.067.11.107l2.926-2.927a.5.5 0 0 0 0-.707Zm-2.931 9.81c-.025.03-.058.052-.082.082a4.97 4.97 0 0 1-.633.639c-.04.036-.072.083-.115.117l2.927 2.927a.5.5 0 0 0 .707 0l.127-.127a.5.5 0 0 0 0-.707l-2.932-2.931Zm-1.443-4.763a3.037 3.037 0 0 0-1.383-1.1l-.012-.007a2.956 2.956 0 0 0-1-.213H12a2.964 2.964 0 0 0-2.122.893c-.285.29-.509.634-.657 1.013l-.009.016a2.96 2.96 0 0 0-.21 1 2.99 2.99 0 0 0 .488 1.716l.032.04a3.04 3.04 0 0 0 1.384 1.1l.012.007c.319.129.657.2 1 .213.393.015.784-.05 1.15-.192.012-.005.021-.013.033-.018a3.01 3.01 0 0 0 1.676-1.7v-.007a2.89 2.89 0 0 0 0-2.207 2.868 2.868 0 0 0-.27-.515c-.007-.012-.02-.025-.03-.039Zm6.137-3.373a2.53 2.53 0 0 1-.349.447l-3.426 3.426c.112.428.166.869.161 1.311a4.954 4.954 0 0 1-.148 1.054l3.413 3.412c.133.134.249.283.347.444A9.88 9.88 0 0 0 22 12.269a9.913 9.913 0 0 0-1.386-5.319ZM16.6 20.264l-3.42-3.421c-.386.1-.782.152-1.18.157h-.135c-.356-.01-.71-.06-1.056-.147L7.4 20.265a2.503 2.503 0 0 1-.444.347A9.884 9.884 0 0 0 11.732 22H12a9.9 9.9 0 0 0 5.044-1.388 2.515 2.515 0 0 1-.444-.348ZM3.735 16.6l3.426-3.426a4.608 4.608 0 0 1-.013-2.367L3.735 7.4a2.508 2.508 0 0 1-.349-.447 9.889 9.889 0 0 0 0 10.1 2.48 2.48 0 0 1 .35-.453Zm5.101-.758a4.959 4.959 0 0 1-.65-.645c-.034-.038-.078-.067-.11-.107L5.15 18.017a.5.5 0 0 0 0 .707l.127.127a.5.5 0 0 0 .706 0l2.932-2.933c-.029-.018-.049-.053-.078-.076Zm-.755-6.928c.03-.037.07-.063.1-.1.183-.22.383-.423.6-.609.046-.04.081-.092.128-.13L5.983 5.149a.5.5 0 0 0-.707 0l-.127.127a.5.5 0 0 0 0 .707l2.932 2.931Z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.64 4.737A7.97 7.97 0 0 1 12 4a7.997 7.997 0 0 1 6.933 4.006h-.738c-.65 0-1.177.25-1.177.9 0 .33 0 2.04-2.026 2.008-1.972 0-1.972-1.732-1.972-2.008 0-1.429-.787-1.65-1.752-1.923-.374-.105-.774-.218-1.166-.411-1.004-.497-1.347-1.183-1.461-1.835ZM6 4a10.06 10.06 0 0 0-2.812 3.27A9.956 9.956 0 0 0 2 12c0 5.289 4.106 9.619 9.304 9.976l.054.004a10.12 10.12 0 0 0 1.155.007h.002a10.024 10.024 0 0 0 1.5-.19 9.925 9.925 0 0 0 2.259-.754 10.041 10.041 0 0 0 4.987-5.263A9.917 9.917 0 0 0 22 12a10.025 10.025 0 0 0-.315-2.5A10.001 10.001 0 0 0 12 2a9.964 9.964 0 0 0-6 2Zm13.372 11.113a2.575 2.575 0 0 0-.75-.112h-.217A3.405 3.405 0 0 0 15 18.405v1.014a8.027 8.027 0 0 0 4.372-4.307ZM12.114 20H12A8 8 0 0 1 5.1 7.95c.95.541 1.421 1.537 1.835 2.415.209.441.403.853.637 1.162.54.712 1.063 1.019 1.591 1.328.52.305 1.047.613 1.6 1.316 1.44 1.825 1.419 4.366 1.35 5.828Z"
                            />
                          </svg>
                        )}
                        {card.type}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 pt-3 flex flex-col justify-between min-h-[220px]">
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {card.title}
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {card.description.length > 100
                          ? `${card.description.slice(0, 100)}...`
                          : card.description}
                      </p>

                      <div className="flex justify-center sm:justify-start mt-2">
                        <button
                          onClick={() => handleExploreClick(card.id)}
                          className="w-10 sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 whitespace-nowrap transition"
                        >
                          <span className="hidden sm:inline">Explore</span>
                          <svg
                            className="w-3.5 h-3.5 ml-0 sm:ml-2"
                            fill="none"
                            viewBox="0 0 14 10"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-5 w-full max-w-6xl">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="w-full bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center p-4 space-x-4 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div
                      className={`w-5 h-16 rounded-full bg-gradient-to-r ${
                        card.colors?.[0] || "from-blue-500"
                      } ${card.colors?.[1] || "to-pink-500"}`}
                    />

                    <div className="flex flex-col flex-grow justify-between space-y-1">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                        {card.title}
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {card.description.length > 100
                          ? `${card.description.slice(0, 100)}...`
                          : card.description}
                      </p>
                      <div>
                        <span
                          className={`text-xs font-medium inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm border
    ${
      card.type === "Private"
        ? "bg-red-100 text-red-800 border-red-400 dark:bg-gray-700 dark:text-red-400"
        : "bg-blue-100 text-blue-800 border-blue-400 dark:bg-gray-700 dark:text-blue-400"
    }
  `}
                        >
                          {/* ICON */}
                          {card.type === "Private" ? (
                            <svg
                              className="w-3.5 h-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="m7.4 3.736 3.43 3.429A5.046 5.046 0 0 1 12.133 7c.356.01.71.06 1.056.147l3.41-3.412a2.32 2.32 0 0 1 .451-.344A9.89 9.89 0 0 0 12.268 2a10.022 10.022 0 0 0-5.322 1.392c.165.095.318.211.454.344Zm11.451 1.54-.127-.127a.5.5 0 0 0-.706 0l-2.932 2.932c.03.023.05.054.078.077.237.194.454.41.651.645.033.038.077.067.11.107l2.926-2.927a.5.5 0 0 0 0-.707Zm-2.931 9.81c-.025.03-.058.052-.082.082a4.97 4.97 0 0 1-.633.639c-.04.036-.072.083-.115.117l2.927 2.927a.5.5 0 0 0 .707 0l.127-.127a.5.5 0 0 0 0-.707l-2.932-2.931Zm-1.443-4.763a3.037 3.037 0 0 0-1.383-1.1l-.012-.007a2.956 2.956 0 0 0-1-.213H12a2.964 2.964 0 0 0-2.122.893c-.285.29-.509.634-.657 1.013l-.009.016a2.96 2.96 0 0 0-.21 1 2.99 2.99 0 0 0 .488 1.716l.032.04a3.04 3.04 0 0 0 1.384 1.1l.012.007c.319.129.657.2 1 .213.393.015.784-.05 1.15-.192.012-.005.021-.013.033-.018a3.01 3.01 0 0 0 1.676-1.7v-.007a2.89 2.89 0 0 0 0-2.207 2.868 2.868 0 0 0-.27-.515c-.007-.012-.02-.025-.03-.039Zm6.137-3.373a2.53 2.53 0 0 1-.349.447l-3.426 3.426c.112.428.166.869.161 1.311a4.954 4.954 0 0 1-.148 1.054l3.413 3.412c.133.134.249.283.347.444A9.88 9.88 0 0 0 22 12.269a9.913 9.913 0 0 0-1.386-5.319ZM16.6 20.264l-3.42-3.421c-.386.1-.782.152-1.18.157h-.135c-.356-.01-.71-.06-1.056-.147L7.4 20.265a2.503 2.503 0 0 1-.444.347A9.884 9.884 0 0 0 11.732 22H12a9.9 9.9 0 0 0 5.044-1.388 2.515 2.515 0 0 1-.444-.348ZM3.735 16.6l3.426-3.426a4.608 4.608 0 0 1-.013-2.367L3.735 7.4a2.508 2.508 0 0 1-.349-.447 9.889 9.889 0 0 0 0 10.1 2.48 2.48 0 0 1 .35-.453Zm5.101-.758a4.959 4.959 0 0 1-.65-.645c-.034-.038-.078-.067-.11-.107L5.15 18.017a.5.5 0 0 0 0 .707l.127.127a.5.5 0 0 0 .706 0l2.932-2.933c-.029-.018-.049-.053-.078-.076Zm-.755-6.928c.03-.037.07-.063.1-.1.183-.22.383-.423.6-.609.046-.04.081-.092.128-.13L5.983 5.149a.5.5 0 0 0-.707 0l-.127.127a.5.5 0 0 0 0 .707l2.932 2.931Z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-3.5 h-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8.64 4.737A7.97 7.97 0 0 1 12 4a7.997 7.997 0 0 1 6.933 4.006h-.738c-.65 0-1.177.25-1.177.9 0 .33 0 2.04-2.026 2.008-1.972 0-1.972-1.732-1.972-2.008 0-1.429-.787-1.65-1.752-1.923-.374-.105-.774-.218-1.166-.411-1.004-.497-1.347-1.183-1.461-1.835ZM6 4a10.06 10.06 0 0 0-2.812 3.27A9.956 9.956 0 0 0 2 12c0 5.289 4.106 9.619 9.304 9.976l.054.004a10.12 10.12 0 0 0 1.155.007h.002a10.024 10.024 0 0 0 1.5-.19 9.925 9.925 0 0 0 2.259-.754 10.041 10.041 0 0 0 4.987-5.263A9.917 9.917 0 0 0 22 12a10.025 10.025 0 0 0-.315-2.5A10.001 10.001 0 0 0 12 2a9.964 9.964 0 0 0-6 2Zm13.372 11.113a2.575 2.575 0 0 0-.75-.112h-.217A3.405 3.405 0 0 0 15 18.405v1.014a8.027 8.027 0 0 0 4.372-4.307ZM12.114 20H12A8 8 0 0 1 5.1 7.95c.95.541 1.421 1.537 1.835 2.415.209.441.403.853.637 1.162.54.712 1.063 1.019 1.591 1.328.52.305 1.047.613 1.6 1.316 1.44 1.825 1.419 4.366 1.35 5.828Z"
                              />
                            </svg>
                          )}
                          {card.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center sm:justify-start mt-2">
                      <button
                        onClick={() => handleExploreClick(card.id)}
                        className="w-10 sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 whitespace-nowrap transition"
                      >
                        <span className="hidden sm:inline">Explore</span>
                        <svg
                          className="w-3.5 h-3.5 ml-0 sm:ml-2"
                          fill="none"
                          viewBox="0 0 14 10"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default Playground;
