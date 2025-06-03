import React, { useState } from "react";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Open");

  const handleSelect = (status) => {
    setSelected(status);
    setIsOpen(false);
  };
  const [selectedColor, setSelectedColor] = useState("");

  const colors = [
    "bg-gray-200",
    "bg-gray-900 dark:bg-gray-700",
    "bg-blue-600",
    "bg-green-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-yellow-300",
    "bg-teal-500",
  ];

  return (
    <div className="w-full m-4 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
        {/* Profile Card */}
        <div className="h-full rounded bg-white">
          {/* Image Section */}
          <div className="rounded bg-white">
            <div className="block rounded-lg p-4 shadow-xs shadow-indigo-100">
              <div className="group relative block h-64 sm:h-80 lg:h-96">
                <span className="absolute inset-0 border-2 border-dashed border-black"></span>

                <div className="relative flex h-full items-end border-2 border-black transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2">
                  <div className="p-4 z-10 transition-opacity group-hover:absolute group-hover:opacity-0 sm:p-6 lg:p-8">
                    <svg
                      className="size-10 sm:size-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div className="relative h-full w-full">
                    <img
                      alt="profile"
                      src="https://images.unsplash.com/photo-1603871165848-0aa92c869fa1"
                      className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-50"
                    />
                    <strong className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-ss-xl rounded-ee-xl bg-green-600 px-3 py-1.5 text-white shadow">
                      <svg
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                      <span className="text-[10px] font-medium sm:text-xs">
                        Solved!
                      </span>
                    </strong>
                  </div>

                  <div className="absolute p-4 opacity-0 transition-opacity group-hover:relative group-hover:opacity-100 sm:p-6 lg:p-8">
                    <h3 className="mt-4 text-xl font-medium sm:text-2xl">
                      Go around the world
                    </h3>
                    <p className="mt-4 text-sm sm:text-base">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Cupiditate, praesentium voluptatem omnis atque culpa
                      repellendus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info + Dropdown */}
          <div className="rounded bg-white pb-6">
            {/* User Info */}
            <div className="px-6 pt-4 pb-2 text-left">
              <p className="text-sm font-medium tracking-widest text-pink-500 uppercase">
                Developer
              </p>
              <p className="text-xl font-bold text-black sm:text-2xl">
                Tony Wayne
              </p>
            </div>

            {/* Status Dropdown */}
            <div className="flex justify-center mt-2">
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  aria-controls="status-menu"
                  className="min-w-[150px] inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Status: {selected}
                  <svg
                    className="ml-2 -mr-1 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.353a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    id="status-menu"
                    className="absolute z-10 mt-2 w-44 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div className="py-1">
                      {["Open", "Busy", "Do Not Disturb", "Custom"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => handleSelect(status)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Toggle Buttons */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {/* Light Mode Button */}
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500"
                >
                  <svg
                    className="w-3 h-3 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                  </svg>
                  Light
                </button>

                {/* Dark Mode Button */}
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500"
                >
                  <svg
                    className="w-3 h-3 mr-2"
                    fill="none"
                    viewBox="0 0 20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"
                    />
                  </svg>
                  Dark
                </button>

                {/* System Default Button */}
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500"
                >
                  <svg
                    className="w-3 h-3 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                    <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                  </svg>
                  System Default
                </button>
              </div>
            </div>
            {/* Color Selector */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {colors.map((colorClass, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(colorClass)}
                    className={`w-5 h-5 rounded-full border-2 ${
                      selectedColor === colorClass
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : "border-transparent"
                    } ${colorClass}`}
                    aria-label={`Select ${colorClass}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="h-full rounded bg-white lg:col-span-2">
          <div className="w-full max-w-5xl mx-auto my-4 p-4 text-center bg-transparent dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
            <form>
              <div className="grid gap-6 mb-6 md:grid-cols-2 text-left">
                {[
                  ["First Name", "first_name", "John"],
                  ["Last Name", "last_name", "Doe"],
                  ["Birthday", "birthday", "", "date"],
                  [
                    "Phone Number",
                    "phone",
                    "123-45-678",
                    "tel",
                    "[0-9]{3}-[0-9]{2}-[0-9]{3}",
                  ],
                  ["Company", "company", "flowbite.com", "url"],
                  ["Designation", "designation", "Software Engineer"],
                  ["Email", "email", "john@example.com", "email"],
                  ["Keyword", "keyword", "AI, Blockchain, etc."],
                ].map(([label, id, placeholder, type = "text", pattern]) => (
                  <div key={id}>
                    <label
                      htmlFor={id}
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      id={id}
                      placeholder={placeholder}
                      required
                      pattern={pattern}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6 text-left">
                <label
                  htmlFor="bio"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows="4"
                  placeholder="A short bio about yourself..."
                  className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="mb-6 text-left">
                <label
                  htmlFor="file_input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Upload profile picture
                </label>
                <input
                  type="file"
                  id="file_input"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
