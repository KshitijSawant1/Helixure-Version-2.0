import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../supabaseClient";

const actionColorMap = {
  SPACE_CREATED: "bg-white text-gray-800 border-gray-300",
  BLOCK_CREATED: "bg-indigo-100 text-indigo-800 border-indigo-300",
  BLOCK_LINKED: "bg-blue-100 text-blue-800 border-blue-300",
  BLOCK_LINKED_REMOVED: "bg-pink-100 text-pink-800 border-pink-300",
  SPACE_EDITED: "bg-gray-100 text-gray-800 border-gray-300",
  USER_JOINED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ROLE_PROMOTED: "bg-green-100 text-green-800 border-green-300",
  ROLE_DEMOTED: "bg-purple-100 text-purple-800 border-purple-300",
  USER_REMOVED: "bg-red-100 text-red-800 border-red-300",
};

const LogDrawer = ({ isOpen, onClose, logs = [], spaceId, setLogs }) => {
  const logChannelRef = useRef(null);
  const [filterType, setFilterType] = useState("ALL");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !spaceId) return;

    if (logChannelRef.current) {
      supabase.removeChannel(logChannelRef.current);
    }

    const logSub = supabase
      .channel(`log-${spaceId}-${Date.now()}`)
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

  useEffect(() => {
    applyFilter(filterType, logs);
  }, [logs, filterType]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs]);

  const applyFilter = (type, rawLogs) => {
    let filtered = [...rawLogs];

    if (type === "DAY") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (log) => new Date(log.timestamp).toDateString() === today
      );
    } else if (type === "BLOCK") {
      filtered = filtered.filter((log) =>
        ["BLOCK_CREATED", "BLOCK_LINKED", "BLOCK_LINKED_REMOVED"].includes(
          log.action
        )
      );
    } else if (type === "USER") {
      filtered = filtered.filter((log) =>
        [
          "USER_JOINED",
          "USER_REMOVED",
          "ROLE_PROMOTED",
          "ROLE_DEMOTED",
        ].includes(log.action)
      );
    }

    filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setFilteredLogs(filtered);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
          SPACE LOGS
        </h2>
      </div>

      {/* Filter button group */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-xs border" role="group">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "ALL"
                ? "bg-gray-900 text-white dark:bg-gray-700"
                : "bg-transparent text-gray-900 dark:text-white"
            } border-r border-gray-900 dark:border-white rounded-l-md hover:bg-gray-900 hover:text-white`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType("DAY")}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "DAY"
                ? "bg-gray-900 text-white dark:bg-gray-700"
                : "bg-transparent text-gray-900 dark:text-white"
            } border-r border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white`}
          >
            By Day
          </button>
          <button
            type="button"
            onClick={() => setFilterType("BLOCK")}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "BLOCK"
                ? "bg-gray-900 text-white dark:bg-gray-700"
                : "bg-transparent text-gray-900 dark:text-white"
            } border-r border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white`}
          >
            By Block
          </button>
          <button
            type="button"
            onClick={() => setFilterType("USER")}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "USER"
                ? "bg-gray-900 text-white dark:bg-gray-700"
                : "bg-transparent text-gray-900 dark:text-white"
            } rounded-r-md hover:bg-gray-900 hover:text-white`}
          >
            By User
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500">No logs to display.</div>
        ) : (
          filteredLogs.map((log, idx) => {
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
                {idx === filteredLogs.length - 1 && <div ref={bottomRef}></div>}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default LogDrawer;
