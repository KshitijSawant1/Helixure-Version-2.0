export const validateInvite = async (code) => {
  try {
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !data) {
      toast.error("Invalid invite code.");
      return false;
    }

    const now = new Date();
    if (data.expires_at && new Date(data.expires_at) < now) {
      toast.error("This invite has expired.");
      return false;
    }

    if (data.used) {
      toast.error("This invite has already been used.");
      return false;
    }

    const { error: updateErr } = await supabase
      .from("invites")
      .update({ used: true })
      .eq("id", data.id);

    if (updateErr) {
      console.error("Failed to mark invite as used", updateErr);
      toast.error("Failed to mark invite as used.");
      return false;
    }

    toast.success("Invite accepted!");
    return true;
  } catch (err) {
    console.error("Unexpected error validating invite", err);
    toast.error("Unexpected error occurred.");
    return false;
  }
};
