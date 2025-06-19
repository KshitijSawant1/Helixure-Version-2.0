import React, { useEffect, useRef } from "react";
import { supabase } from "../../../../supabaseClient";

const actionColorMap = {
  SPACE_CREATED: "bg-white text-gray-800 border-gray-300",
  BLOCK_CREATED: "bg-indigo-100 text-indigo-800 border-indigo-300",
  BLOCK_LINKED: "bg-blue-100 text-blue-800 border-blue-300",
  SPACE_EDITED: "bg-gray-100 text-gray-800 border-gray-300",
  USER_JOINED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ROLE_PROMOTED: "bg-green-100 text-green-800 border-green-300",
  ROLE_DEMOTED: "bg-purple-100 text-purple-800 border-purple-300",
  USER_REMOVED: "bg-red-100 text-red-800 border-red-300",
};

const LogDrawer = ({ isOpen, onClose, logs = [], spaceId, setLogs }) => {
  const logChannelRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !spaceId) return;

    // Clean up existing channel
    if (logChannelRef.current) {
      supabase.removeChannel(logChannelRef.current);
    }

    // Create a new unique channel
    const logSub = supabase
      .channel(`log-${spaceId}-${Date.now()}`) // ensure unique name
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "space_log_table" },
        (payload) => {
          if (payload.new.space_id === spaceId) {
            setLogs((prev) => {
              const exists = prev.some((log) => log.id === payload.new.id);
              return exists ? prev : [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    logChannelRef.current = logSub;

    return () => {
      if (logChannelRef.current) {
        supabase.removeChannel(logChannelRef.current);
        logChannelRef.current = null;
      }
    };
  }, [isOpen, spaceId, setLogs]);

  if (!isOpen) return null;

  return (
    <>
      <div className="p-4 space-y-4">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500">No logs to display.</div>
        ) : (
          logs.map((log) => {
            const colorClass =
              actionColorMap[log.action] ||
              "bg-gray-50 text-gray-700 border-gray-200";
            return (
              <div key={log.id} className="space-y-1">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{log.username}</span> •{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div
                  className={`border rounded-lg px-4 py-2 ${colorClass}`}
                  style={{
                    maxWidth: "90%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {log.description || log.action}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default LogDrawer;
