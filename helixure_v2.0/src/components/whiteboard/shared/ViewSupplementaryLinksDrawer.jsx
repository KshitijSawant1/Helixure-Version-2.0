import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../../supabaseClient";
import { registerLog } from "../../../utils/logUtils";

const ViewSupplementaryLinksDrawer = ({
  isOpen,
  onClose,
  supplementaryLinks = [],
  blocks = [],
  onSuccess,
}) => {
  const [localLinks, setLocalLinks] = useState([]);

  useEffect(() => {
    const sortedLinks = [...supplementaryLinks].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    setLocalLinks(sortedLinks);
  }, [supplementaryLinks]);

  const getBlockLabel = (id) => {
    const block = blocks.find((b) => b.id === id);
    return block
      ? `#${block.block_sr} - ${block.block_title}`
      : "Unknown Block";
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this link?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("shared_playground_links")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove link");
    } else {
      toast.success("Link removed successfully");
      setLocalLinks((prev) => prev.filter((link) => link.id !== id));

      // Log the removal
      try {
        // Find the link info for the log description
        const removedLink = localLinks.find((link) => link.id === id);
        const desc = removedLink
          ? `Removed link Block#${getBlockLabel(
              removedLink.source_block_id
            )} to Block #${getBlockLabel(removedLink.target_block_id)}`
          : `Removed link ID ${id}`;

        // Fetch user for log
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: profile } = await supabase
          .from("profiles")
          .select("firstname, lastname")
          .eq("id", user.id)
          .maybeSingle();

        const fullName = profile
          ? `${profile.firstname} ${profile.lastname}`
          : "Unknown";

        await registerLog({
          space_id: removedLink?.space_id || "",
          user_id: user.id,
          username: fullName,
          action: "BLOCK_LINKED_REMOVED",
          description: desc,
        });
      } catch (logErr) {
        console.error("Failed to register removal log", logErr);
      }

      onSuccess?.();
    }
  };

  return (
    isOpen && (
      <>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
            ACTIVE CUSTOM LINKS
          </h2>
        </div>

        {localLinks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No supplementary links found in this space.
          </p>
        ) : (
          <ul className="space-y-4">
            {localLinks.map((link) => (
              <li
                key={link.id}
                className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                  <strong>Source:</strong> {getBlockLabel(link.source_block_id)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                  <strong>Target:</strong> {getBlockLabel(link.target_block_id)}
                </div>
                {link.note && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Note:</strong> {link.note}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Created By:{" "}
                  {link.profiles
                    ? `${link.profiles.firstname} ${link.profiles.lastname}`
                    : "Unknown"}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Created At: {new Date(link.created_at).toLocaleString()}
                </div>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Remove Link
                </button>
              </li>
            ))}
          </ul>
        )}
      </>
    )
  );
};

export default ViewSupplementaryLinksDrawer;
