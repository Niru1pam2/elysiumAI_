import { Mic, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../features/createConversation";
import sendMessage from "../features/sendMessage";
import {
  addConversation,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { addMessage } from "../redux/messageSlice";

export default function ChatInput() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!value.trim() || loading) return;

    const userPrompt = value.trim();
    setValue(""); // Clear input early

    let conversation = selectedConversation;

    // 1. Auto-create conversation if none exists
    if (!conversation) {
      try {
        const initialTitle =
          userPrompt.length > 30 ? `${userPrompt.slice(0, 30)}...` : userPrompt;

        const conv = await createConversation(initialTitle);

        // Set selected conversation first
        dispatch(setSelectedConversation(conv));
        dispatch(addConversation(conv));
        conversation = conv;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
    }

    // 2. Dispatch user message AFTER conversation is set in Redux
    const userMessage = { role: "user", content: userPrompt };
    dispatch(addMessage(userMessage));

    try {
      setLoading(true);

      const payload = {
        prompt: userPrompt,
        conversationId: conversation._id,
      };

      const data = await sendMessage(payload);

      if (data) {
        const aiMessage = { role: "assistant", content: data };
        dispatch(addMessage(aiMessage));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className="flex flex-col gap-2 p-3 bg-white/3 border border-white/6 rounded-2xl focus-within:border-indigo-500/40 focus-within:bg-white/4 transition-all duration-200 shadow-lg shadow-black/20">
        <textarea
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-500 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50 min-h-18"
          placeholder="Ask anything..."
          rows={3}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          value={value}
          disabled={loading}
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-all duration-150 cursor-pointer"
              title="Attach file"
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
            disabled={!value.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
