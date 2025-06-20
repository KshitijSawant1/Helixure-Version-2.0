import React, { useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../../supabaseClient";
import ViewSupplementaryLinksDrawer from "./ViewSupplementaryLinksDrawer"; // Import your view component
import { registerLog } from "../../../utils/logUtils";

const CreateSupplementaryLinkDrawer = ({
  isOpen,
  onClose,
  spaceId,
  onSuccess,
  blocks,
  supplementaryLinks,
}) => {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create"); // NEW state for toggling

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) {
      toast.error("Please select different source and target blocks.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("firstname, lastname")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile)
        throw new Error("Failed to fetch user profile");

      const fullName = `${profile.firstname} ${profile.lastname}`;

      const { error: insertError } = await supabase
        .from("shared_playground_links")
        .insert({
          space_id: spaceId,
          source_block_id: sourceId,
          target_block_id: targetId,
          created_by: user.id,
          created_by_name: fullName,
          note,
        });

      if (insertError) throw new Error(insertError.message);

      // 🧠 Use block_sr in log
      const sourceBlock = blocks.find((b) => b.id === sourceId);
      const targetBlock = blocks.find((b) => b.id === targetId);

      const sourceLabel = sourceBlock
        ? `#${sourceBlock.block_sr}`
        : `#${sourceId}`;
      const targetLabel = targetBlock
        ? `#${targetBlock.block_sr}`
        : `#${targetId}`;

      await registerLog({
        space_id: spaceId,
        user_id: user.id,
        username: fullName,
        action: "BLOCK_LINKED",
        description: `Linked Block ${sourceLabel} to Block ${targetLabel}${
          note ? ` (${note})` : ""
        }`,
      });

      toast.success("Supplementary link created & logged!");
      onSuccess?.();
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSourceId("");
    setTargetId("");
    setNote("");
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex justify-end">
        <div className="w-[24rem] h-screen bg-white/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
              CUSTOM LINKS
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Button Group Toggle */}
          <div className="flex justify-center pt-2">
            <div
              className="inline-flex w-full border rounded-md shadow-xs"
              role="group"
            >
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 text-sm font-medium w-1/2 ${
                  activeTab === "create"
                    ? "bg-gray-900 text-white dark:bg-gray-700"
                    : "bg-transparent text-gray-900 dark:text-white"
                } rounded-l-md border-r border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700`}
              >
                Create Link
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("view")}
                className={`px-4 py-2 text-sm font-medium w-1/2 ${
                  activeTab === "view"
                    ? "bg-gray-900 text-white dark:bg-gray-700"
                    : "bg-transparent text-gray-900 dark:text-white"
                } rounded-r-md hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700`}
              >
                View Links
              </button>
            </div>
          </div>

          {/* Render based on active tab */}
          {activeTab === "create" ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Source Block
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select source block</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {`#${b.block_sr} - ${b.block_title}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Target Block
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select target block</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {`#${b.block_sr} - ${b.block_title}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Link Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  placeholder="Describe this link..."
                  className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white ${
                  loading ? "bg-blue-300" : "bg-blue-700 hover:bg-blue-800"
                } font-medium rounded-lg text-sm px-5 py-2.5`}
              >
                {loading ? "Creating..." : "Create Link"}
              </button>
            </form>
          ) : (
            <ViewSupplementaryLinksDrawer
              isOpen={true}
              onClose={() => setActiveTab("create")}
              supplementaryLinks={supplementaryLinks}
              blocks={blocks}
            />
          )}
        </div>
      </div>
    )
  );
};

export default CreateSupplementaryLinkDrawer;
