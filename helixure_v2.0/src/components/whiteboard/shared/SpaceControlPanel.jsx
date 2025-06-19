import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-toastify";
import { registerLog } from "../../../utils/logUtils";

const SpaceControlPanel = ({ spaceId, userRole }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === "Owner" && spaceId) {
      fetchMembers();
    }
  }, [spaceId, userRole]);

  const fetchMembers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("shared_playground_members")
      .select("*")
      .eq("space_id", spaceId);

    if (error) {
      console.error("Fetch members error:", error);
      toast.error("Failed to load members");
      setMembers([]);
    } else {
      const processed = data.map((m) => ({
        ...m,
        role: m.role || "Viewer",
      }));
      setMembers(processed);
    }

    setLoading(false);
  };

const updateRole = async (memberId, newRole) => {
  const { data: member, error: fetchError } = await supabase
    .from("shared_playground_members")
    .select("*")
    .eq("id", memberId)
    .single();

  if (fetchError || !member) {
    toast.error("Failed to fetch member info");
    console.error("Fetch member error:", fetchError);
    return;
  }

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  const actorName = `${actor.user_metadata?.firstname || ""} ${
    actor.user_metadata?.lastname || ""
  }`.trim();

  const { error } = await supabase
    .from("shared_playground_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) {
    console.error("Update role error:", error);
    toast.error("Failed to update role");
    return;
  }

  toast.success("Role updated successfully");

  // Log with actor's info
  await registerLog({
    space_id: spaceId,
    user_id: actor.id,
    username: actorName,
    action: newRole === "Editor" ? "ROLE_PROMOTED" : "ROLE_DEMOTED",
    description: `${actorName} ${newRole === "Editor" ? "promoted" : "demoted"} ${member.username} to ${newRole}`,
  });

  fetchMembers();
};

const removeMember = async (memberId) => {
  if (!window.confirm("Are you sure you want to remove this member?")) return;

  const { data: member, error: fetchError } = await supabase
    .from("shared_playground_members")
    .select("*")
    .eq("id", memberId)
    .single();

  if (fetchError || !member) {
    toast.error("Failed to fetch member info");
    console.error("Fetch member error:", fetchError);
    return;
  }

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  const actorName = `${actor.user_metadata?.firstname || ""} ${
    actor.user_metadata?.lastname || ""
  }`.trim();

  const { error } = await supabase
    .from("shared_playground_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    console.error("Remove member error:", error);
    toast.error("Failed to remove member");
    return;
  }

  toast.success("Member removed successfully");

  await registerLog({
    space_id: spaceId,
    user_id: actor.id,
    username: actorName,
    action: "USER_REMOVED",
    description: `${actorName} removed ${member.username} from the space`,
  });

  fetchMembers();
};


  if (userRole !== "Owner") {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300">
        🚫 Sorry, only the <strong>Owner</strong> can access the Control Panel.
      </div>
    );
  }

  return (
    <div className=" dark:bg-gray-800 rounded space-y-2">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
        Control Panel: Manage Member Access
      </h2>

      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Loading members...
        </p>
      ) : members.filter((m) => m.role !== "Owner").length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No invited members found in this space.
        </p>
      ) : (
        <table className="w-full text-sm bg-white border text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Remove</th>
            </tr>
          </thead>
          <tbody>
            {members
              .filter((member) => member.role !== "Owner")
              .map((member) => (
                <tr key={member.id} className="border-b dark:border-gray-600">
                  <td className="px-4 py-2">
                    {member.username || member.user_id || "Unnamed Member"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        updateRole(
                          member.id,
                          member.role === "Editor" ? "Viewer" : "Editor"
                        )
                      }
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition ${
                        member.role === "Editor"
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition ${
                          member.role === "Editor"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      ></span>
                    </button>
                    <span className="ml-2 text-xs">{member.role}</span>
                  </td>
                  <td className="px-4 py-2 flex items-center justify-center">
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SpaceControlPanel;
