// EditSpaceForm.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";
import { registerLog } from "../../utils/logUtils";

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

const EditSpaceForm = ({ spaceId, onUpdated, isShared = false }) => {
  const [spaceName, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [spaceType, setSpaceType] = useState("Shared");
  const [selectedColors, setSelectedColors] = useState([]);

  useEffect(() => {
    if (!spaceId) return;

    const fetchSpace = async () => {
      const table = isShared ? "shared_playground" : "playground";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", spaceId)
        .single();

      if (error) {
        toast.error("Failed to load space details");
        return;
      }

      setSpaceName(data.title);
      setDescription(data.description);
      setSpaceType(data.type);
      const c1 = Object.entries(colorMap).find(
        ([_, v]) => v[0] === data.color1
      )?.[0];
      const c2 = Object.entries(colorMap).find(
        ([_, v]) => v[1] === data.color2
      )?.[0];
      setSelectedColors([c1, c2].filter(Boolean));
    };

    fetchSpace();
  }, [spaceId]);

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
    if (!spaceId || selectedColors.length === 0) {
      toast.error("Space ID and 2 colors required");
      return;
    }

    let chosen = [...selectedColors];
    if (chosen.length === 1) {
      const fallback = colors.find((c) => c !== chosen[0]);
      chosen.push(fallback);
    }

    const finalColors = [colorMap[chosen[0]][0], colorMap[chosen[1]][1]];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const table = isShared ? "shared_playground" : "playground";
    const matchCondition = isShared
      ? { id: spaceId, owner: user.id }
      : { id: spaceId, user_id: user.id };

    // ✅ Fetch previous data
    const { data: prevData, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .eq("id", spaceId)
      .single();

    if (fetchError || !prevData) {
      toast.error("Could not fetch previous data");
      return;
    }

    // ✅ Update
    const { error } = await supabase
      .from(table)
      .update({
        title: spaceName,
        description,
        type: spaceType,
        color1: finalColors[0],
        color2: finalColors[1],
      })
      .match(matchCondition);

    if (error) {
      toast.error("Update failed: " + error.message);
      return;
    }

    // ✅ Register logs
    const username = `${user.user_metadata?.firstname || ""} ${
      user.user_metadata?.lastname || ""
    }`.trim();

    if (spaceName !== prevData.title) {
      await supabase.from("space_log_table").insert({
        space_id: spaceId,
        user_id: user.id,
        username,
        action: "SPACE_EDITED",
        description: `Title changed to "${spaceName}"`,
      });
    }

    if (description !== prevData.description) {
      await supabase.from("space_log_table").insert({
        space_id: spaceId,
        user_id: user.id,
        username,
        action: "SPACE_EDITED",
        description: `Description changed.`,
      });
    }

    if (
      finalColors[0] !== prevData.color1 ||
      finalColors[1] !== prevData.color2
    ) {
      await supabase.from("space_log_table").insert({
        space_id: spaceId,
        user_id: user.id,
        username,
        action: "SPACE_EDITED",
        description: `Colors changed to ${finalColors[0]}, ${finalColors[1]}`,
      });
    }

    toast.success("Space updated successfully!");
    if (onUpdated) onUpdated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div>
        <label
          htmlFor="website-admin"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Space Title
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
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
                d="m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
              />
            </svg>
          </span>
          <input
            type="text"
            id="website-admin"
            required
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Space Title
        </label>
        <textarea
          id="message"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        ></textarea>
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
          className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Save Changes
          </span>
        </button>
      </div>
    </form>
  );
};

export default EditSpaceForm;
