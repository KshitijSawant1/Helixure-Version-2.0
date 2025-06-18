import React, { useState, useEffect } from "react";
import EditSpaceForm from "../EditSpaceModal"; // Ensure this import is correct
import InviteCodeGenerator from "./InviteCodeGenerator";
import SpaceControlPanel from "./SpaceControlPanel";

const EditSpace = ({
  isOpen,
  onClose,
  spaceId,
  showGas,
  toggleGas,
  togglePow,
  userRole = "Viewer",
}) => {
  const [powEnabled, setPowEnabled] = useState(false);
  const [roleSelection, setRoleSelection] = useState("Viewer");
  useEffect(() => {
    togglePow(powEnabled); // pass new value to parent
  }, [powEnabled]);

  return (
    isOpen && (
      <div className="fixed  z-[1000] inset-0 z-40 bg-black/30 backdrop-blur-sm flex">
        <div className="w-[26rem] h-screen bg-white/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto transition-transform p-6 space-y-4 relative">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
              EDIT SHARED SPACE INFO
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
          </div>

          {userRole === "Owner" || userRole === "Editor" ? (
            <>
              {/* Form */}
              <EditSpaceForm
                spaceId={spaceId}
                onUpdated={onClose}
                isShared={true}
              />
              <div className="mt-6 flex items-center justify-between w-full">
                <span className="text-m font-medium text-gray-900 dark:text-gray-300">
                  Toggle Gas Usage Visibility
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showGas}
                    onChange={toggleGas}
                  />
                  <div
                    className="relative w-11 h-6 bg-gray-200 rounded-full border border-gray-400
      peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
      dark:bg-gray-700 dark:border-gray-600 
      peer-checked:after:translate-x-full 
      rtl:peer-checked:after:-translate-x-full 
      peer-checked:after:border-white 
      after:content-[''] after:absolute after:top-0.5 after:start-[2px] 
      after:bg-white after:border-gray-300 after:border after:rounded-full 
      after:h-5 after:w-5 after:transition-all 
      peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-between w-full">
                <span className="text-m font-medium text-gray-900 dark:text-gray-300">
                  Toggle PoW Mini-Games
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={powEnabled}
                    onChange={(e) => setPowEnabled(e.target.checked)}
                  />
                  <div
                    className="relative w-11 h-6 bg-gray-200 rounded-full border border-gray-400
      peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
      dark:bg-gray-700 dark:border-gray-600 
      peer-checked:after:translate-x-full 
      rtl:peer-checked:after:-translate-x-full 
      peer-checked:after:border-white 
      after:content-[''] after:absolute after:top-0.5 after:start-[2px] 
      after:bg-white after:border-gray-300 after:border after:rounded-full 
      after:h-5 after:w-5 after:transition-all 
      peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <hr className="w-full h-1 my-4 bg-gray-300 border-0 rounded-sm dark:bg-gray-700" />

              {/* Owner options */}
              {userRole === "Owner" && (
                <InviteCodeGenerator spaceId={spaceId} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center mt-10 p-4 border border-yellow-400 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700 rounded-lg">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Sorry, to access the edit space feature you have to be promoted
                to editor access.
              </p>
            </div>
          )}
          {userRole === "Owner" && (
            <>
              <hr className="w-full h-1 my-4 bg-gray-300 border-0 rounded-sm dark:bg-gray-700" />
              <SpaceControlPanel spaceId={spaceId} userRole={userRole} />
            </>
          )}
        </div>
      </div>
    )
  );
};

export default EditSpace;
