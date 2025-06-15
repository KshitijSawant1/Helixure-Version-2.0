import React from "react";
import { supabase } from "../supabaseClient";

const prebuiltAvatars = [
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/1.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/2.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/3.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/4.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/5.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/6.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/7.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/8.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/9.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/10.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/12.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/13.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/14.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/15.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/16.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/17.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/18.png?updatedAt=1749919993477",
  "https://ik.imagekit.io/rhzh8en76/Helixure%20v2.0%20Assests/19.png?updatedAt=1749919993477",
];

const AvatarModal = ({ setFormState, formState, closeModal, userId }) => {
  const handleAvatarSelect = async (url) => {
    // Update local state
    setFormState({ ...formState, avatarUrl: url });

    // Save to Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ avatarUrl: url })
      .eq("id", userId);

    if (error) {
      console.error("Failed to save avatar:", error.message);
      alert("Failed to save avatar.");
    } else {
      console.log("Avatar updated in Supabase:", url);
    }

    // Close modal
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Select an Avatar
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
          {prebuiltAvatars.map((url, idx) => (
            <div key={idx} className="relative w-full">
              <div className="pb-[100%] relative">
                {" "}
                {/* Maintains square by padding */}
                <img
                  src={url}
                  alt={`Avatar ${idx + 1}`}
                  className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer rounded-lg border border-gray-300 hover:ring-2 hover:ring-blue-500"
                  onClick={() => handleAvatarSelect(url)}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={closeModal}
          className="mt-4 mx-auto block rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AvatarModal;
