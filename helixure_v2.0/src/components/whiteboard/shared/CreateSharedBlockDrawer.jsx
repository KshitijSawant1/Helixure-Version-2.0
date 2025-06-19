import React, { useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../../supabaseClient";
import hashBlock from "../../../utils/hashBlock";
import getBlockColor from "../../../utils/getBlockColor";
import PoWGameModal from "../PoWGameModal";
import "../InstructionModal.css";
import { registerLog } from "../../../utils/logUtils";

const CreateSharedBlockDrawer = ({
  isOpen,
  onClose,
  spaceId,
  onSuccess,
  requirePoW,
  gasUsed,
  powGameName,
  userRole,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPoWModal, setShowPoWModal] = useState(false);

  const createBlock = async (gasValue = 0.000028, gameName = "") => {
    const gasForDB = requirePoW
      ? parseFloat(Number(gasValue).toFixed(6))
      : 0.000028;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not found");
    const user_id = user.id;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("firstname, lastname, designation, avatarUrl")
      .eq("id", user_id)
      .maybeSingle();

    if (profileError || !profileData) {
      throw new Error("Failed to fetch profile data");
    }

    let fileURL = null;
    if (file) {
      const path = `blocks/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("block-files")
        .upload(path, file);
      if (uploadError) throw new Error("File upload failed");
      fileURL = supabase.storage.from("block-files").getPublicUrl(path)
        .data.publicUrl;
    }

    const { data: latestBlock } = await supabase
      .from("shared_space_block")
      .select("block_sr, hash")
      .eq("space_id", spaceId)
      .order("block_sr", { ascending: false })
      .limit(1)
      .single();

    const nextBlockSr = (latestBlock?.block_sr || 0) + 1;
    const previousHash = latestBlock
      ? latestBlock.hash
      : "00000000000000000000000000000000000000000";

    const hueColor = getBlockColor();

    const blockData = {
      user_id,
      space_id: spaceId,
      block_sr: nextBlockSr,
      block_title: title,
      block_desp: description,
      block_file: fileURL
        ? [{ name: file.name, url: fileURL }]
        : [{ name: "default.txt", url: "https://example.com/default.txt" }],
      previous_hash: previousHash,
      hue_color: hueColor,
      pow_solved: requirePoW,
      gas: gasForDB,
      pow_game: requirePoW ? gameName : "",
      created_at: new Date().toISOString().replace("Z", ""),
      role: userRole || "Viewer",
      user_name: `${profileData.firstname} ${profileData.lastname}`,
      user_designation: profileData.designation,
      user_avatar: String(profileData.avatarUrl || "default-avatar-url.png"),
    };

    const generatedHash = hashBlock(blockData);
    console.log("📝 Block Data being inserted:", blockData);

    const { error: insertError } = await supabase
      .from("shared_space_block")
      .insert({ ...blockData, hash: generatedHash });

    if (insertError) throw new Error(insertError.message || "Insert failed");

    // Register BLOCK_CREATED log
    await registerLog({
      space_id: spaceId,
      user_id,
      username: `${profileData.firstname} ${profileData.lastname}`,
      action: "BLOCK_CREATED",
      description: `Block "${title}" created`,
    });

    await updateTotalGasAfterNewBlock(spaceId, gasForDB);

    toast.success("Shared Block created!");
    onSuccess?.();
    resetForm();
  };

  const updateTotalGasAfterNewBlock = async (space_id, newBlockGas) => {
    try {
      const { data: blocks, error } = await supabase
        .from("shared_space_block")
        .select("gas")
        .eq("space_id", space_id);

      if (error) {
        console.error("❌ Error fetching block gas values:", error.message);
        return;
      }

      const totalGas = blocks.reduce((sum, b) => sum + (Number(b.gas) || 0), 0);
      const updatedGas = parseFloat(
        (totalGas + Number(newBlockGas)).toFixed(6)
      );

      const { error: updateError } = await supabase
        .from("shared_playground")
        .update({ total_gas: updatedGas })
        .match({ id: space_id });

      if (updateError) {
        console.error("❌ Failed to update total_gas:", updateError.message);
      } else {
        console.log("✅ total_gas updated to:", updatedGas);
      }
    } catch (err) {
      console.error("❌ Exception updating total gas:", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !spaceId) {
      toast.error("All fields are required.");
      return;
    }

    if (requirePoW) {
      setShowPoWModal(true);
      return;
    }

    try {
      setLoading(true);
      await createBlock();
    } catch (err) {
      toast.error(err.message || "Failed to create block");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed  inset-0 z-[9999] inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-end">
        <div className="w-[24rem] h-screen bg-white/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
              ADD SHARED BLOCK
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="block-title"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Block Title
              </label>
              <input
                type="text"
                id="block-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter block title"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="block-description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Block Description
              </label>
              <textarea
                id="block-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required
                placeholder="Describe the purpose of this block..."
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
              {loading ? "Creating..." : "Create Shared Block"}
            </button>
          </form>
        </div>

        {showPoWModal && (
          <PoWGameModal
            isOpen={showPoWModal}
            onClose={() => setShowPoWModal(false)}
            onSuccess={(gas, gameName) => {
              setShowPoWModal(false);
              setLoading(true);
              createBlock(Number(gas), gameName)
                .then(() => setLoading(false))
                .catch((err) => {
                  toast.error(err.message || "Block creation failed");
                  setLoading(false);
                });
            }}
          />
        )}
      </div>
    )
  );
};

export default CreateSharedBlockDrawer;
