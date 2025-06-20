import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import ChatHeader from "./chatfiles/ChatHeader";
import ChatMessage from "./chatfiles/ChatMessages";
import ChatInput from "./chatfiles/ChatInput";
import LogDrawer from "./chatfiles/LogDrawer";
import { registerLog } from "../../../utils/logUtils";
import OnlineUsersPanel from "./OnlineUsersPanel";

const ChatLog = ({ isOpen, onClose, spaceId }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user", error);
      else setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isOpen || !spaceId) return;

    const loadInitialData = async () => {
      const { data: chatData, error: chatErr } = await supabase
        .from("space_chat_messages")
        .select("*")
        .eq("space_id", spaceId)
        .order("timestamp", { ascending: true });
      if (!chatErr) setChatMessages(chatData);

      const { data: logData, error: logErr } = await supabase
        .from("space_log_table")
        .select("*")
        .eq("space_id", spaceId)
        .order("timestamp", { ascending: true });
      if (!logErr) setLogs(logData);
    };

    loadInitialData();

    const chatSub = supabase
      .channel(`chat-${spaceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "space_chat_messages" },
        (payload) => {
          if (payload.new.space_id === spaceId) {
            setChatMessages((prev) => {
              const exists = prev.some((m) => m.id === payload.new.id);
              return exists ? prev : [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    const logSub = supabase
      .channel(`logs-${spaceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "space_log_table" },
        (payload) => {
          if (payload.new.space_id === spaceId) {
            setLogs((prev) => {
              const exists = prev.some((l) => l.id === payload.new.id);
              return exists ? prev : [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatSub);
      supabase.removeChannel(logSub);
    };
  }, [isOpen, spaceId]);

  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("avatarUrl, firstname, lastname")
      .eq("id", user.id)
      .single();

    const username = `${profile?.firstname || "Anon"} ${
      profile?.lastname || ""
    }`.trim();
    const avatarUrl = profile?.avatarUrl || null;

    const tempMsg = {
      id: `temp-${Date.now()}`,
      space_id: spaceId,
      user_id: user.id,
      username,
      avatarUrl,
      message: msg.trim(),
      timestamp: new Date().toISOString(),
      temp: true,
    };

    setChatMessages((prev) => [...prev, tempMsg]);

    const { data, error } = await supabase
      .from("space_chat_messages")
      .insert({
        space_id: spaceId,
        user_id: user.id,
        username,
        avatarUrl,
        message: msg.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Send message error:", error);
      return;
    }

    setChatMessages((prev) =>
      prev.filter((m) => m.id !== tempMsg.id).concat(data)
    );

    await registerLog(
      spaceId,
      user.id,
      username,
      "CHAT_MESSAGE",
      `Sent: ${msg.trim()}`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-[1000] inset-0 bg-[#f3f8ff]/90 backdrop-blur-sm flex">
      <div className="w-[26rem] h-screen bg-[#f3f8ff]/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto flex flex-col">
        <ChatHeader onClose={onClose} />
        <OnlineUsersPanel spaceId={spaceId} currentUser={currentUser} />
        <div className="flex justify-center pt-4">
          <div
            className="inline-flex w-3/4 border rounded-md shadow-xs"
            role="group"
          >
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 text-sm font-medium w-1/2 ${
                activeTab === "chat"
                  ? "bg-gray-900 text-white dark:bg-gray-700"
                  : "bg-transparent text-gray-900 dark:text-white"
              } rounded-l-md border-r border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700`}
            >
              In Space Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("log")}
              className={`px-4 py-2 text-sm font-medium w-1/2 ${
                activeTab === "log"
                  ? "bg-gray-900 text-white dark:bg-gray-700"
                  : "bg-transparent text-gray-900 dark:text-white"
              } rounded-r-md hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700`}
            >
              Activity Logs
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === "chat" &&
            chatMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                senderType={msg.user_id === currentUser?.id ? "user" : "agent"}
                username={msg.username || "Unknown"}
                avatarUrl={msg.avatarUrl}
                content={msg.message}
                timestamp={msg.timestamp}
                type="text"
              />
            ))}

          {activeTab === "log" && (
            <LogDrawer
              isOpen={true}
              onClose={() => setActiveTab("chat")}
              logs={logs}
              spaceId={spaceId}
              setLogs={setLogs}
            />
          )}
        </div>

        {activeTab === "chat" && (
          <div className="p-2 border-t">
            <ChatInput onSend={handleSendMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLog;
