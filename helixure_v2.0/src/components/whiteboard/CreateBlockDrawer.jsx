import React, { useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../../supabaseClient";
import "./InstructionModal.css";
import hashBlock from "../../utils/hashBlock";
import getBlockColor from "../../utils/getBlockColor";
import PoWGameModal from "./PoWGameModal";

const CreateBlockDrawer = ({
  isOpen,
  onClose,
  spaceId,
  onSuccess,
  requirePoW,
  gasUsed,
  powGameName,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPoWModal, setShowPoWModal] = useState(false);

  const createBlock = async (gasValue = 0.000028, gameName = "") => {
    const numericGas = Number(gasValue); // Ensure it's a number
    const gasForDB = requirePoW ? parseFloat(numericGas.toFixed(6)) : 0.000028;

    console.log("🛠 Inserting block with gas:", gasForDB);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not found");

    const user_id = user.id;
    let fileURL = null;

    // Upload file if provided
    if (file) {
      const filePath = `blocks/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("block-files")
        .upload(filePath, file);
      if (uploadError) throw new Error("File upload failed");

      const { data: publicUrlData } = supabase.storage
        .from("block-files")
        .getPublicUrl(filePath);
      fileURL = publicUrlData?.publicUrl;
    }

    // Get the previous block in the space
    const { data: latestBlock } = await supabase
      .from("space_block_table")
      .select("block_sr, hash")
      .eq("space_id", spaceId)
      .order("block_sr", { ascending: false })
      .limit(1)
      .single();

    const nextBlockSr = (latestBlock?.block_sr || 0) + 1;
    const previousHash = latestBlock?.hash || "";
    const hueColor = getBlockColor();

    // Prepare block data
    const blockDataToHash = {
      user_id,
      space_id: spaceId,
      block_sr: nextBlockSr,
      block_title: title,
      block_description: description,
      block_files: fileURL
        ? [{ name: file.name, url: fileURL }]
        : [{ name: "default.txt", url: "https://example.com/default.txt" }],
      previous_hash: previousHash,
      hue_color: hueColor,
      pow_solved: requirePoW,
      // When inserting:
      gas: gasForDB,

      pow_game: requirePoW ? gameName : "",

      timestamp: new Date().toISOString().replace("Z", ""),
    };

    const generatedHash = hashBlock(blockDataToHash);

    // Insert block
    const { error: insertError } = await supabase
      .from("space_block_table")
      .insert({
        ...blockDataToHash,
        hash: generatedHash,
      });

    if (insertError) throw new Error(insertError.message || "Insert failed");

    toast.success("Block created successfully!");
    onSuccess?.();
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !spaceId) {
      toast.error("All fields including spaceId are required.");
      return;
    }

    if (requirePoW) {
      setShowPoWModal(true);
      return;
    }

    try {
      setLoading(true);
      await createBlock(); // Directly create block if PoW is not required
    } catch (error) {
      toast.error(error.message || "Block creation failed");
      console.error(error);
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
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-end">
        <div className="w-[24rem] h-screen bg-white/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
              ADD BLOCK
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

            <div>
              <label
                htmlFor="dropzone-file"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Attach Files
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021 4 4 0 0 0 5 13h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag & drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG or GIF (max 800x400px)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white ${
                loading ? "bg-blue-300" : "bg-blue-700 hover:bg-blue-800"
              } font-medium rounded-lg text-sm px-5 py-2.5`}
            >
              {loading ? "Creating..." : "Create Block"}
            </button>
          </form>
        </div>
        {showPoWModal && (
          <PoWGameModal
            isOpen={showPoWModal}
            onClose={() => setShowPoWModal(false)}
            onSuccess={(gas, gameName) => {
              console.log(
                "✅ PoW completed with gas:",
                gas,
                "and game:",
                gameName
              );

              const numericGas = Number(gas); // ✅ Ensure gas is number
              setShowPoWModal(false);
              setLoading(true);
              createBlock(numericGas, gameName)
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

export default CreateBlockDrawer;
