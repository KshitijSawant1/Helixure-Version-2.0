import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { registerLog } from "../utils/logUtils";

const colorMap = {
  gray: ["from-gray-700", "to-gray-700", "bg-gray-700"],
  lblue: ["from-blue-400", "to-blue-400", "bg-blue-400"],
  lgreen: ["from-green-400", "to-green-400", "bg-green-400"],
  pink: ["from-pink-500", "to-pink-500", "bg-pink-500"],
  red: ["from-red-500", "to-red-500", "bg-red-500"],
  yellow: ["from-yellow-400", "to-yellow-400", "bg-yellow-400"],
  orange: ["from-orange-400", "to-orange-400", "bg-orange-400"],
  purple: ["from-purple-500", "to-purple-500", "bg-purple-500"],
  indigo: ["from-indigo-500", "to-indigo-500", "bg-indigo-500"],
  teal: ["from-teal-500", "to-teal-500", "bg-teal-500"],
};

const colors = Object.keys(colorMap);
const generate7DigitCode = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

const NewSpaceModal = ({ isOpen, onClose, onCreated }) => {
  const [spaceName, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [spaceType, setSpaceType] = useState("Shared");
  const [selectedColors, setSelectedColors] = useState([]);

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : prev.length < 2
        ? [...prev, color]
        : prev
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedColors.length === 0) {
      alert("Please select at least one color.");
      return;
    }

    let chosen = [...selectedColors];
    if (chosen.length === 1) {
      const other = colors.find((c) => c !== chosen[0]);
      chosen.push(other);
    }

    const finalColors = [colorMap[chosen[0]][0], colorMap[chosen[1]][1]];
    const user = (await supabase.auth.getUser()).data.user;

    let table, insertData;

    if (spaceType === "Private") {
      table = "playground";
      insertData = {
        title: spaceName,
        description,
        type: spaceType,
        color1: finalColors[0],
        color2: finalColors[1],
        user_id: user.id,
      };
    } else {
      table = "shared_playground";
      const inviteCode = generate7DigitCode();

      insertData = {
        title: spaceName,
        description,
        color1: finalColors[0],
        color2: finalColors[1],
        owner: user.id,
        invite_code: inviteCode,
        code_generated_at: new Date().toISOString(),
        last_invite_action_at: new Date().toISOString(),
        invite_expiry_minutes: 60, // Default expiry: 60 mins
        invite_status: "active",
        type: "shared",
      };
    }

    const { data, error } = await supabase
      .from(table)
      .insert([insertData])
      .select()
      .single();

    if (error) {
      alert("Error creating space: " + error.message);
      return;
    }

    if (spaceType === "Shared" && data?.id) {
      // Insert owner as a member
      const { error: memberError } = await supabase
        .from("shared_playground_members")
        .insert({
          space_id: data.id,
          user_id: user.id,
          role: "Owner",
        });

      if (memberError) {
        console.error("Failed to insert owner as member:", memberError.message);
        toast.error("Owner membership creation failed");
      }
    }
    // Register SPACE_CREATED log
    await registerLog({
      space_id: data.id,
      user_id: user.id,
      username: user.user_metadata
        ? `${user.user_metadata.firstname} ${user.user_metadata.lastname}`
        : "Unknown",
      action: "SPACE_CREATED",
      description: `Space "${spaceName}" created`,
    });

    toast.success("Space created successfully!");
    if (onCreated) onCreated();
    onClose();
    setSpaceName("");
    setDescription("");
    setSpaceType("Shared");
    setSelectedColors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/30">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-lg p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Space
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
              Space Name
            </label>
            <input
              type="text"
              required
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              placeholder="Enter space name"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
              Description
            </label>
            <textarea
              rows="3"
              required
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              placeholder="Write a short description..."
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-white">
              Type:
            </span>
            {["Private", "Shared"].map((type) => (
              <label key={type} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="spaceType"
                  value={type}
                  checked={spaceType === type}
                  onChange={(e) => setSpaceType(e.target.value)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-white">
                  {type}
                </span>
              </label>
            ))}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
              Choose 2 Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColors.includes(color)
                      ? "ring-2 ring-offset-2 ring-gray-800"
                      : "border-gray-300"
                  } ${colorMap[color][2]}`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium"
            >
              Create Space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSpaceModal;
