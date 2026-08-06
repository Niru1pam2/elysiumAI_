import { PanelLeft } from "lucide-react";
import { useSelector } from "react-redux";

export default function Nav({ onOpenMobileSidebar }) {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);

  return (
    <header className="flex items-center gap-3 px-4 h-16 border-b border-white/10 bg-[#0d0f14] shrink-0">
      {/* Sidebar Toggle Button */}
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
        title="Open Sidebar"
      >
        <PanelLeft size={18} />
      </button>

      {/* Conversation Info */}
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <h2 className="text-sm font-semibold text-slate-100 truncate">
          {selectedConversation?.title || "New Chat"}
        </h2>

        {messages && messages.length > 0 && (
          <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
            {messages.length} Messages
          </span>
        )}
      </div>
    </header>
  );
}
