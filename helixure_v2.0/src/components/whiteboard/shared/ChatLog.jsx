import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import ChatHeader from "./chatfiles/ChatHeader";
import ChatMessage from "./chatfiles/ChatMessages";
import ChatInput from "./chatfiles/ChatInput";

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
        .from("space_logs")
        .select("*")
        .eq("space_id", spaceId)
        .order("timestamp", { ascending: true });
      if (!logErr) setLogs(logData);
    };

    loadInitialData();

    const chatSub = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "space_chat_messages" },
        (payload) => {
          if (payload.new.space_id === spaceId) {
            setChatMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    const logSub = supabase
      .channel("logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "space_logs" },
        (payload) => {
          if (payload.new.space_id === spaceId) {
            setLogs((prev) => [...prev, payload.new]);
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

    const { error } = await supabase.from("space_chat_messages").insert({
      space_id: spaceId,
      user_id: user.id,
      username,
      avatarUrl,
      message: msg.trim(),
    });

    if (error) {
      console.error("Send message error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-[1000] inset-0 z-40 bg-[#f3f8ff]/90 backdrop-blur-sm flex">
      <div className="w-[26rem] h-screen bg-[#f3f8ff]/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto flex flex-col">
        <ChatHeader onClose={onClose} />

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
              Chat
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
              Log
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

          {activeTab === "log" &&
            logs.map((log) => (
              <div
                key={log.id}
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                <strong>{log.username}</strong> {log.action}
                <div className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
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
