import React from "react";

const ChatMessages = ({
  senderType,
  username,
  content,
  timestamp,
  avatarUrl,
  type,
}) => {
  const isUser = senderType === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2.5`}>
      {!isUser && (
        <img
          className="w-8 h-8 rounded-md object-cover"
          src={avatarUrl || "/default-avatar.png"}
          alt={`${username || "User"} avatar`}
        />
      )}
      <div className="flex flex-col gap-1 w-full max-w-[320px]">
        <div
          className={`flex items-center ${
            isUser ? "justify-end" : ""
          } space-x-2 rtl:space-x-reverse`}
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {username && username !== "Anon"
              ? username
              : isUser
              ? "You"
              : "Unknown"}
          </span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div
          className={`flex flex-col leading-1.5 p-4 border-gray-200 ${
            isUser
              ? "bg-blue-500 text-white border border-transparent rounded-s-xl rounded-se-xl"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-e-xl rounded-es-xl"
          }`}
        >
          {type === "text" && <p className="text-sm font-normal">{content}</p>}
        </div>
      </div>
      {isUser && (
        <img
          className="w-8 h-8 rounded-md object-cover"
          src={avatarUrl || "/default-avatar.png"}
          alt={`${username || "You"} avatar`}
        />
      )}
    </div>
  );
};

export default ChatMessages;
