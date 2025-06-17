import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../../supabaseClient"; // adjust if needed

const generateCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const InviteCodeGenerator = ({ spaceId }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    setInviteCode("");
    setInviteLink("");
  }, [spaceId]);

  const saveInvite = async (spaceId, code, link) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      toast.error("User not authenticated for invite save.");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry

    // Check for existing code (collision)
    const { data: existing } = await supabase
      .from("invites")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (existing) {
      toast.error("Code collision, try again!");
      return;
    }

    const { error } = await supabase.from("invites").insert([
      {
        space_id: spaceId,
        code,
        link,
        user_id: userData.user.id,
        expires_at: expiresAt.toISOString(),
        used: false,
      },
    ]);

    if (error) {
      console.error("Failed to save invite:", error);
      toast.error("Failed to save invite.");
    } else {
      toast.success("Invite saved with expiry!");
    }
  };

  const handleGenerateInvite = async () => {
    if (!spaceId) {
      toast.error("Space ID is missing.");
      return;
    }

    const code = generateCode();
    const link = `${window.location.origin}/join/${code}`;

    // Save invite (handles collision check inside)
    await saveInvite(spaceId, code, link);

    setInviteCode(code);
    setInviteLink(link);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed."));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded space-y-2">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
        INVITE TO SPACE
      </h2>
      <div>
        <button
          type="button"
          onClick={handleGenerateInvite}
          disabled={!spaceId}
          className={`${
            !spaceId
              ? "bg-gray-400 cursor-not-allowed"
              : "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          } font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center`}
        >
          Generate New Invite
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
        <div className="mb-3 mt-6">
          <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">
            Invite Code
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={inviteCode || "+"}
              className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(inviteCode?.trim())}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 ml-2"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-white">
            Invite Link
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={inviteLink || "+"}
              className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(inviteLink?.trim())}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 ml-2"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCodeGenerator;
