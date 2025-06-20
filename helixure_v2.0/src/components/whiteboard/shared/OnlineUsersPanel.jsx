import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const OnlineUsersPanel = ({ spaceId, currentUser }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Heartbeat
  useEffect(() => {
    if (!spaceId || !currentUser) return;

    const interval = setInterval(async () => {
      await supabase.from("space_sessions").upsert(
        {
          space_id: spaceId,
          user_id: currentUser.id,
          username: `${currentUser.user_metadata?.firstname || ""} ${
            currentUser.user_metadata?.lastname || ""
          }`.trim(),
          last_seen: new Date().toISOString(),
        },
        { onConflict: ["space_id", "user_id"] }
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [spaceId, currentUser]);

  // Fetch and filter
  useEffect(() => {
    if (!spaceId) return;

    const fetchOnlineUsers = async () => {
      const since = new Date(Date.now() - 30000).toISOString();

      const { data: sessions } = await supabase
        .from("space_sessions")
        .select("*")
        .eq("space_id", spaceId)
        .gte("last_seen", since);

      const { data: members } = await supabase
        .from("shared_playground_members")
        .select("user_id")
        .eq("space_id", spaceId);

      const memberUserIds = members.map((m) => m.user_id);

      const filtered = sessions.filter((s) =>
        memberUserIds.includes(s.user_id)
      );

      // Fetch profile avatars (optional: cache this separately to reduce calls)
      const enriched = await Promise.all(
        filtered.map(async (user) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatarUrl")
            .eq("id", user.user_id)
            .maybeSingle();

          return {
            ...user,
            avatarUrl: profile?.avatarUrl || "/default-avatar.png",
          };
        })
      );

      setOnlineUsers(enriched);
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000);

    return () => clearInterval(interval);
  }, [spaceId]);

  return (
    <div className="p-2  text-sm border-b dark:bg-gray-800 rounded">
      <strong>Online Users:</strong>
      <ul className="mt-2 space-y-2">
        {onlineUsers.length === 0 && (
          <li className="text-gray-500">No users online</li>
        )}
        {onlineUsers.map((user) => (
          <li key={user.user_id} className="flex items-center space-x-2">
            <div className="relative">
              <img
                className="w-10 h-10 rounded-sm object-cover"
                src={user.avatarUrl}
                alt={user.username}
              />
              <span className="absolute bottom-0 left-8 transform translate-y-1/4 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div>
            <span>{user.username || "Unnamed User"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsersPanel;
