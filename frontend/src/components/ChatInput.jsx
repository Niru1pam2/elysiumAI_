import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../features/createConversation";
import sendMessage from "../features/sendMessage";
import {
  addConversation,
  setSelectedConversation,
} from "../redux/conversationSlice";
import {
  addMessage,
  setArtifacts,
  setLoading,
  setMessages,
} from "../redux/messageSlice";
import api from "../../utils/axios";
import { setUser } from "../redux/userSlice";

export default function ChatInput() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message);
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const [value, setValue] = useState("");

  const handleSendMessage = async () => {
    if (!value.trim() || isLoading) return;

    const userPrompt = value.trim();
    setValue(""); // Clear input early

    let conversation = selectedConversation;

    // 1. Auto-create conversation if none exists
    if (!conversation) {
      try {
        const initialTitle =
          userPrompt.length > 30 ? `${userPrompt.slice(0, 30)}...` : userPrompt;

        const conv = await createConversation(initialTitle);

        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
        dispatch(setSelectedConversation(conv));
        dispatch(addConversation(conv));
        conversation = conv;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
    }

    // 2. Dispatch user message to UI
    const userMessage = { role: "user", content: userPrompt };
    dispatch(addMessage(userMessage));

    try {
      dispatch(setLoading(true));

      const formData = new FormData();

      formData.append("prompt", userPrompt);
      formData.append("conversationId", conversation._id);
      formData.append("agent", selectedAgent.toLowerCase());
      formData.append("file", selectedFile);

      // Send prompt to AI Agent service
      const resData = await sendMessage(formData);

      if (resData) {
        const newArtifacts = resData.artifacts || [];

        const aiMessage = {
          role: "assistant",
          content: resData.answer,
          images: resData.images || [],
          artifacts: newArtifacts,
        };

        // Add assistant message to Redux
        dispatch(addMessage(aiMessage));
        setSelectedFile(null);

        // Append new artifacts if present (instead of blowing away previous ones)
        if (newArtifacts.length > 0) {
          dispatch(setArtifacts((prev) => [...prev, ...newArtifacts]));
          // Note: or use dispatch(addArtifacts(newArtifacts)) if you have a dedicated action
        }

        // Fetch fresh user data (credits deducted) with unique variable name
        try {
          const { data: updatedUserData } = await api.get("/api/me");
          if (updatedUserData) {
            dispatch(setUser(updatedUserData));
          }
        } catch (userErr) {
          console.error("Failed to refresh user credits:", userErr);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "vision",
      icon: ImageIcon,
      label: "vision",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className="flex flex-col gap-2 p-3 bg-white/3 border border-white/6 rounded-2xl focus-within:border-indigo-500/40 focus-within:bg-white/4 transition-all duration-200 shadow-lg shadow-black/20">
        {/* Agent Selector Pills */}
        <div className="flex w-full md:w-[80%] gap-2 pr-2 flex-wrap items-center">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;

            return (
              <button
                key={agent.label}
                type="button"
                onClick={() => setSelectedAgent(agent.label)} // Replace with your dispatch or state setter
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/20"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200 hover:border-white/20"
                }`}
              >
                {Icon && (
                  <Icon
                    size={14}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                )}
                <span>{agent.label}</span>
              </button>
            );
          })}
        </div>
        {selectedFile && (
          <div className="my-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              {selectedFile.type === "application/pdf" ? (
                <FileText size={16} className="text-red-400" />
              ) : selectedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : null}

              {/* File Name Label */}
              <span className="text-xs text-slate-300 truncate max-w-37.5">
                {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="cursor-pointer"
              >
                <X className="text-red-500" size={16} />
              </button>
            </div>
          </div>
        )}

        <textarea
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-500 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-18"
          placeholder="Ask anything..."
          rows={3}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          value={value}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf,image/*"
              hidden
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-all duration-150 cursor-pointer"
              title="Attach file"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={18} />
            </button>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-all duration-150 cursor-pointer"
              title="Voice input"
            >
              <Mic size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            className="p-2 text-white bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 active:scale-95 rounded-xl transition-all duration-150 cursor-pointer shadow-md shadow-indigo-500/20 disabled:opacity-40"
            title="Send message"
            disabled={!value.trim() || isLoading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
