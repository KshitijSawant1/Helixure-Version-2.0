import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";
import { registerLog } from "../../utils/logUtils";

const JoinSpaceModal = ({ isOpen, onClose }) => {
  const [inviteInput, setInviteInput] = useState("");
  const [loading, setLoading] = useState(false);

  const insertMemberWithUsername = async (spaceId, userId, role = "Viewer") => {
    console.log("➡ Inserting member for space:", spaceId, "user:", userId);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("firstname, lastname")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      toast.error("Failed to fetch user profile");
      console.error("Profile fetch error:", profileError);
      return false;
    }

    const username = `${profile.firstname} ${profile.lastname}`.trim();

    const { data: insertResult, error: insertError } = await supabase
      .from("shared_playground_members")
      .insert([
        {
          space_id: spaceId,
          user_id: userId,
          role,
          username,
        },
      ])
      .select(); // Get inserted row back for confirmation

    if (insertError) {
      toast.error("Failed to add member");
      console.error("Insert member error:", insertError);
      return false;
    }

    await registerLog({
      space_id: spaceId,
      user_id: userId,
      username,
      action: "USER_JOINED",
      description: `${username} joined the space as ${role}`,
    });
    console.log("✅ USER_JOINED log inserted via utility");

    console.log("✅ Inserted member:", insertResult);
    return true;
  };

  const handleJoin = async () => {
    if (!inviteInput.trim()) {
      toast.error("Please enter an invite code or link.");
      return;
    }

    let code = inviteInput.trim();
    if (code.includes("/join/")) {
      code = code.split("/join/")[1]?.split(/[?#]/)[0] || code;
    }

    try {
      setLoading(true);

      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (inviteError || !invite) {
        toast.error("Invalid invite code or link.");
        return;
      }

      if (new Date(invite.expires_at) < new Date()) {
        toast.error("This invite has expired.");
        return;
      }

      if (invite.used) {
        toast.error("This invite has already been used.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const { data: existing } = await supabase
        .from("shared_playground_members")
        .select("*")
        .eq("space_id", invite.space_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        toast.info("You have already joined this space.");
        return;
      }

      const success = await insertMemberWithUsername(invite.space_id, user.id);
      if (success) {
        await supabase
          .from("invites")
          .update({ used: true })
          .eq("id", invite.id);

        toast.success("Successfully joined the space!");
        onClose();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-[24rem] shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            Join Shared Space
          </h2>
          <input
            autoFocus
            aria-label="Invite code or link"
            type="text"
            placeholder="Enter Invite Code or Link"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value.trimStart())}
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleJoin}
              disabled={loading}
              className={`${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white px-3 py-1 rounded`}
            >
              {loading ? "Joining..." : "Join Space"}
            </button>
            <button
              onClick={() => {
                setInviteInput("");
                onClose();
              }}
              className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default JoinSpaceModal;
