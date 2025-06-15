import React, { useState, useRef, useEffect } from "react";
import { useUserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import defpfp from "../assets/images/defpfp.png";
import { supabase } from "../supabaseClient";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import helixureIcon from "../assets/logos/hv2b.png";
import AvatarModal from "./AvatarModal";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { session, user, signOut } = useUserAuth();
  const navigate = useNavigate();
  const metadata = user?.user_metadata || {};
  const memberSince = user?.user_metadata?.memberSince;
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const formattedMemberSince = new Date(memberSince).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const [selectedimgColor, setSelectedimgColor] = useState("gray");

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Open");

  const handleSelect = (status) => {
    setSelected(status);
    setFormState((prev) => ({ ...prev, status }));
    updateSingleField("status", status);
    setIsOpen(false);
  };

  const updateSingleField = async (field, value) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", user.id);

    if (error) {
      toast.error(`Failed to update ${field}`);
      console.error(`Failed to update ${field}:`, error.message);
    } else {
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated`
      );
      console.log(` Updated ${field}: ${value}`);
    }
  };

  const [selectedColor, setSelectedColor] = useState("");
  const [formState, setFormState] = useState({
    firstname: metadata.firstname || "",
    lastname: metadata.lastname || "",
    dob: metadata.dob || "",
    phone: metadata.phone || "",
    company: "",
    designation: "",
    email: user?.email || "",
    tagline: "",
    bio: "",
    avatarUrl: metadata.avatarUrl || "",
    status: "Open",
    systemTheme: "System",
  });
  const colorMap = {
    gray: { bg: "#d1d5db", border: "#6b7280" },
    blue: { bg: "#bfdbfe", border: "#3b82f6" },
    green: { bg: "#bbf7d0", border: "#22c55e" },
    pink: { bg: "#f9a8d4", border: "#ec4899" },
    red: { bg: "#fca5a5", border: "#ef4444" },
    orange: { bg: "#fdba74", border: "#f97316" },
    yellow: { bg: "#fef08a", border: "#eab308" },
    purple: { bg: "#e9d5ff", border: "#a855f7" },
    indigo: { bg: "#c7d2fe", border: "#6366f1" },
    teal: { bg: "#99f6e4", border: "#14b8a6" },
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const isFormComplete = () => {
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

    return requiredFields.every((field) => {
      return formState[field] && formState[field].toString().trim() !== "";
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // this path is enough; uploads to avatars bucket root

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    setFormState({ ...formState, avatarUrl: publicUrl });
  };

  const getMemberSince = () => {
    const date = metadata.memberSince
      ? new Date(metadata.memberSince)
      : new Date();
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data) {
        console.warn("No profile found. Possibly first-time user.");

        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: user.id,
          firstname: metadata.firstname || "",
          lastname: metadata.lastname || "",
          dob: metadata.dob || "",
          phone: metadata.phone || "",
          email: user.email,
          avatarUrl: metadata.avatarUrl || "",
          selectedColor: metadata.selectedColor || "gray",
          memberSince: new Date().toISOString(),
        });

        if (upsertError) {
          console.error("Failed to create fallback profile:", upsertError);
          return;
        }

        setFormState((prev) => ({
          ...prev,
          firstname: metadata.firstname || "",
          lastname: metadata.lastname || "",
          dob: metadata.dob || "",
          phone: metadata.phone || "",
          email: user.email,
          selectedColor: "gray",
          avatarUrl: metadata.avatarUrl || "",
        }));

        setSelectedimgColor("gray");

        return;
      }

      // Only run if profile data was found
      setFormState(data);
      setSelectedimgColor(data.selectedColor || "gray");
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      console.log("Fetched data:", data);
      console.log("Keys:", Object.keys(data));
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    console.log("Saving profile with:", {
      id: user?.id,
      ...formState,
      selectedColor: selectedimgColor,
    });

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...formState,
      selectedColor: selectedimgColor,
      memberSince: metadata.memberSince || new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to save profile:", error.message);
      alert("Failed to save profile: " + error.message);
    } else {
      console.log("Profile saved successfully.");
      setIsEditing(false);
      toast.success("Profile saved!");

      // ✅ If complete, navigate to playground
      if (isFormComplete()) {
        navigate("/playground");
      }
    }
  };

  const statusStyles = {
    Open: {
      bg: "bg-green-600",
      icon: (
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
            d="M11.403 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.403a3.01 3.01 0 0 1-1.743-1.612l-3.025 3.025A3 3 0 1 1 9.99 9.768l3.025-3.025A3.01 3.01 0 0 1 11.403 5Z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M13.232 4a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v5.768a1 1 0 1 1-2 0V6.414l-6.182 6.182a1 1 0 0 1-1.414-1.414L17.586 5h-3.354a1 1 0 0 1-1-1Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    Busy: {
      bg: "bg-yellow-500",
      icon: (
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
      ),
    },
    "Do Not Disturb": {
      bg: "bg-red-600",
      icon: (
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
            d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
  };

  return (
    <>
      <div className="flex justify-center text-center">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-6xl dark:text-white">
          Welcome{" "}
          <mark
            className="px-2 text-white rounded-sm"
            style={{
              backgroundColor: colorMap[selectedimgColor]?.bg || "#6b7280", // fallback to gray
            }}
          >
            {user?.user_metadata?.firstname || user?.email}
          </mark>
        </h1>
      </div>

      <div className="w-full m-4 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
          {/* Profile Card */}
          <div className="h-full rounded bg-white">
            {/* Image Section */}
            <div className="rounded bg-white">
              <div className="block rounded-lg p-4 shadow-xs shadow-indigo-100">
                <div className="group relative block h-64 sm:h-80 lg:h-96">
                  <span
                    className="absolute inset-0 border-2 border-dashed"
                    style={{
                      borderColor:
                        colorMap[selectedimgColor]?.border || "#6b7280",
                    }}
                  ></span>
                  <div
                    className="relative flex h-full items-end transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2"
                    style={{
                      backgroundColor:
                        colorMap[selectedimgColor]?.bg || "#d1d5db",
                      border: `2px solid ${
                        colorMap[selectedimgColor]?.border || "#6b7280"
                      }`,
                    }}
                  >
                    <div className="p-4 z-10 transition-opacity group-hover:absolute group-hover:opacity-0 sm:p-6 lg:p-8 flex justify-center items-center">
                      <img
                        src={helixureIcon}
                        alt="Helixure Icon"
                        className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                      />
                    </div>

                    <div className="relative h-full w-full">
                      <img
                        alt="profile"
                        src={formState.avatarUrl || defpfp}
                        onError={(e) => {
                          e.currentTarget.src = defpfp;
                        }}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-50"
                      />

                      {selected && (
                        <strong
                          className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-ss-xl rounded-ee-xl px-3 py-1.5 text-white shadow ${statusStyles[selected]?.bg}`}
                        >
                          {statusStyles[selected]?.icon}
                          <span className="text-[10px] font-medium sm:text-xs">
                            {selected}
                          </span>
                        </strong>
                      )}
                    </div>

                    <div className="absolute p-4 opacity-0 transition-opacity group-hover:relative group-hover:opacity-100 sm:p-6 lg:p-8">
                      <h3 className="mt-4 text-xl font-medium sm:text-2xl">
                        {formState.tagline || "Your Creative Tagline"}
                      </h3>
                      <p className="mt-4 text-sm sm:text-base">
                        {formState.bio ||
                          "Tell us more about yourself in this section..."}
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
                  {formState.designation || "Designation"}
                </p>
                <p className="text-xl font-bold text-black sm:text-2xl">
                  {formState.firstname || "First"}{" "}
                  {formState.lastname || "Last"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Member Since: {formattedMemberSince || "N/A"}
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
                        {["Open", "Busy", "Do Not Disturb"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleSelect(status)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {status}
                          </button>
                        ))}
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
                    onClick={() => {
                      setFormState((prev) => ({
                        ...prev,
                        systemTheme: "Light",
                      }));
                      updateSingleField("systemTheme", "Light"); // ✅ auto-save
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500"
                  >
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 9a3 3 0 0 1 3-3m-2 15h4m0-3c0-4.1 4-4.9 4-9A6 6 0 1 0 6 9c0 4 4 5 4 9h4Z"
                      />
                    </svg>
                    Light
                  </button>

                  {/* Dark Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({
                        ...prev,
                        systemTheme: "Dark",
                      }));
                      updateSingleField("systemTheme", "Dark");
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500"
                  >
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
                        d="M7.05 4.05A7 7 0 0 1 19 9c0 2.407-1.197 3.874-2.186 5.084l-.04.048C15.77 15.362 15 16.34 15 18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1c0-1.612-.77-2.613-1.78-3.875l-.045-.056C6.193 12.842 5 11.352 5 9a7 7 0 0 1 2.05-4.95ZM9 21a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Zm1.586-13.414A2 2 0 0 1 12 7a1 1 0 1 0 0-2 4 4 0 0 0-4 4 1 1 0 0 0 2 0 2 2 0 0 1 .586-1.414Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dark
                  </button>

                  {/* System Default Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({
                        ...prev,
                        systemTheme: "System",
                      }));
                      updateSingleField("systemTheme", "System");
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500"
                  >
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      />
                    </svg>
                    System Default
                  </button>
                </div>
              </div>
              {/* Color Selector */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {Object.keys(colorMap).map((color) => (
                    <button
                      key={color}
                      onClick={async () => {
                        setSelectedimgColor(color);
                        setFormState((prev) => ({
                          ...prev,
                          selectedColor: color,
                        }));
                        toast.success("Color saved!", { autoClose: 1000 });
                        setFormState((prev) => ({
                          ...prev,
                          selectedColor: color,
                        }));

                        const { error } = await supabase
                          .from("profiles")
                          .upsert({
                            id: user.id,
                            ...formState,
                            selectedColor: color,
                          });

                        if (error) {
                          console.error(
                            "Failed to update color:",
                            error.message
                          );
                        } else {
                          console.log("Color updated in DB:", color);
                        }
                      }}
                      className={`w-5 h-5 rounded-full border-2 ${
                        selectedimgColor === color
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: colorMap[color].bg,
                        borderColor: colorMap[color].border,
                      }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="w-full mt-6 flex justify-center">
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="h-full rounded bg-white lg:col-span-2">
            <div className="w-full max-w-5xl mx-auto my-4 p-4 text-center bg-transparent dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
              <form>
                <div className="grid gap-6 mb-6 md:grid-cols-2 text-left">
                  {[
                    ["First Name", "firstname", metadata.firstname || "John"],
                    ["Last Name", "lastname", metadata.lastname || "Doe"],
                    ["Birthday", "dob", metadata.dob || "", "date"],
                    [
                      "Phone Number",
                      "phone",
                      metadata.phone || "123-45-678",
                      "tel",
                    ],
                    ["Company", "company", "url"],
                    ["Designation", "designation"],
                    ["Email", "email", user?.email || ""],
                    ["Tagline", "tagline"],
                  ].map(([label, id, value, type = "text"]) => (
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
                        value={formState[id] ?? ""}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormState({ ...formState, [id]: e.target.value })
                        }
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
                    value={formState.bio ?? ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormState({ ...formState, bio: e.target.value })
                    }
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
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      id="file_input"
                      disabled={!isEditing}
                      className="min-w-0 flex-grow text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAvatarModal(true)}
                      disabled={!isEditing}
                      className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                    >
                      <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                        Choose Prebuilt Avatar
                      </span>
                    </button>
                  </div>
                </div>

                {showAvatarModal && (
                  <AvatarModal
                    setFormState={setFormState}
                    formState={formState}
                    closeModal={() => setShowAvatarModal(false)}
                    userId={user.id}
                  />
                )}

                <div className="flex justify-end space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditing(true);
                      }}
                      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                    >
                      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                        Edit Profile
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isFormComplete()) {
                            handleSaveProfile();
                          } else {
                            toast.error(
                              "Please fill all fields before saving."
                            );
                          }
                        }}
                        disabled={!isFormComplete()}
                        className={`rounded px-3 py-1 text-white ${
                          isFormComplete()
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsEditing(false);
                        }}
                        className="rounded bg-gray-400 px-3 py-1 text-white hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
