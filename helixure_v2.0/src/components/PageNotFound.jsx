import React from "react";

const PageNotFound = () => {
  return (
    <section className="bg-white dark:bg-gray-900 flex flex-col items-center justify-center min-h-screen relative">
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10 pb-10">
        {/* First 4 */}
        <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-extrabold text-blue-600 dark:text-blue-400">
          4
        </div>

        {/* The animated 0 (styled div) */}
        <div
          className="w-8 h-8 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-48 lg:h-48 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-[20%]"
          style={{
            animation: "spin 5s linear infinite",
          }}
        ></div>

        {/* Second 4 */}
        <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-extrabold text-blue-600 dark:text-blue-400">
          4
        </div>
      </div>

      <p className="mt-8 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
        Oops, page not found!
      </p>
      <p className="mb-8 text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400">
        The page you're looking for doesn’t exist.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-base sm:text-lg font-medium dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Back to Home
      </a>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </section>
  );
};

export default PageNotFound;
