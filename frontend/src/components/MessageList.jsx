import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import LoadingAnimation from "./LoadingAnimation";
import { useEffect, useRef } from "react";

export default function MessageList() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages, isLoading } = useSelector((state) => state.message);

  const bottomRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef?.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages?.length, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
      {messages?.length == 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center gap-6 text-center select-none">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
              ElysiumAI_
            </h1>
            <p className="text-base font-medium text-slate-300 tracking-tight">
              How can I help you today?
            </p>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mt-1">
              Ask me anything - code, ideas, explanations, or just a quick
              question.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-md">
            {[
              "Write a Netflix clone",
              "Explain redis",
              "Build a dashboard",
            ].map((s) => (
              <button
                key={s}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-200 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {messages?.map((msg, i) => (
            <div key={i} className="mt-3">
              <MessageBubble
                role={msg?.role}
                content={msg?.content}
                images={msg.images || []}
              />
            </div>
          ))}

          {isLoading && <LoadingAnimation />}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
