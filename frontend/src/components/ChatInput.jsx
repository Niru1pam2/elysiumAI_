import { Paperclip, Mic, Send } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import sendMessage from "../features/sendMessage";
import { addMessage, setMessages } from "../redux/messageSlice"; // Or use addMessage if available

export default function ChatInput() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!value.trim() || !selectedConversation?._id || loading) return;

    const userPrompt = value.trim();
    setValue(""); // Clear input early for snappy UX

    const userMessage = { role: "user", content: userPrompt };

    // 1. Correct Array Spread
    const updatedMessages = [...messages, userMessage];
    dispatch(addMessage(updatedMessages));

    try {
      setLoading(true);

      const payload = {
        prompt: userPrompt,
        conversationId: selectedConversation._id,
      };

      const data = await sendMessage(payload);

      // 2. Append the AI response to Redux
      if (data) {
        const aiMessage = { role: "assistant", content: data };
        dispatch(setMessages([...updatedMessages, aiMessage]));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter key press (unless Shift + Enter is held for newlines)
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
          disabled={loading || !selectedConversation}
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
            disabled={!value.trim() || loading || !selectedConversation}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
