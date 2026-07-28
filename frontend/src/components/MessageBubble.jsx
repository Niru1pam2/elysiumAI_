import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Code Block Component with Syntax Highlighting & Copy Button
function CodeBlock({ language, codeString }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d0f14]">
      {/* Code Bar Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-[11px] text-slate-400 font-mono select-none">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="text-emerald-400" size={13} />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Output */}
      <SyntaxHighlighter
        style={atomDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "0.875rem 1rem",
          background: "transparent",
          fontSize: "13px",
          lineHeight: "1.5",
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ role, content = "", images = [] }) {
  const isUser = role === "user";
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
            isUser
              ? "bg-linear-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
              : "bg-white/4 border border-white/[0.07] text-slate-200 rounded-tl-sm"
          }`}
        >
          {/* Attached Images */}
          {images && images.length > 0 && (
            <div className="flex flex-wrap gap-3 my-2">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Attachment ${i + 1}`}
                  loading="lazy"
                  onClick={() => setSelectedImg(img)}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-pointer hover:opacity-90 transition"
                />
              ))}
            </div>
          )}

          {/* Markdown Output */}
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              strong: ({ children }) => (
                <strong className="font-bold text-white">{children}</strong>
              ),
              h1: ({ children }) => (
                <h1 className="text-lg font-bold text-slate-100 my-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-semibold text-slate-200 my-2">
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className="mb-1.5 text-slate-300 leading-relaxed">
                  {children}
                </p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline hover:text-indigo-300 transition-colors"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside pl-5 my-2 space-y-1 text-slate-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside pl-5 my-2 space-y-1 text-slate-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed pl-1">{children}</li>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-white/5 text-slate-200 border-b border-white/10">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-white/5">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-white/5 transition-colors">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-3.5 py-2 font-semibold text-slate-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3.5 py-2 text-slate-300">{children}</td>
              ),
              // Code Renderer
              code: ({ className, children, ...props }) => {
                const value = String(children).replace(/\n$/, "");
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !value.includes("\n");

                if (!isInline) {
                  return (
                    <CodeBlock
                      language={match ? match[1] : ""}
                      codeString={value}
                    />
                  );
                }

                return (
                  <code
                    className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-[12.5px] font-mono border border-white/5"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </Markdown>
        </div>
      </div>

      {/* Simple Image Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img
              src={selectedImg}
              alt="Expanded view"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}
