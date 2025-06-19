// utils/logUtils.js
import { supabase } from "../supabaseClient";

export const registerLog = async ({
  space_id,
  user_id,
  username,
  action,
  description = "",
}) => {
  const { error } = await supabase.from("space_log_table").insert({
    space_id,
    user_id,
    username,
    action,
    description,
  });
  if (error) {
    console.error(`⚠️ Failed to insert ${action} log:`, error.message);
  }
};
