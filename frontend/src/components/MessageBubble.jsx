import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Download, Maximize2, X, Sparkles } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Code Block Component
function CodeBlock({ language, codeString }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0f14]">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-[11px] text-slate-400 font-mono select-none">
        <span className="text-slate-300 font-medium">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="text-emerald-400" size={13} />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <SyntaxHighlighter
        style={atomDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "transparent",
          fontSize: "13px",
          lineHeight: "1.6",
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
      <div
        className={`w-full py-4 flex ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex gap-3 max-w-[88%] lg:max-w-[78%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Gemini AI Sparkle Icon Avatar */}
          {!isUser && (
            <div className="size-7 rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
              <Sparkles size={14} />
            </div>
          )}

          {/* Bubble Wrapper */}
          <div
            className={`text-[15px] leading-relaxed ${
              isUser
                ? "bg-[#1e2029] border border-white/10 text-slate-100 px-4 py-3 rounded-3xl rounded-tr-md shadow-sm"
                : "text-slate-200 flex-1 min-w-0"
            }`}
          >
            {/* User Attached Images */}
            {images && images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    loading="lazy"
                    onClick={() => setSelectedImg(img)}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="w-36 h-24 rounded-2xl object-cover border border-white/10 cursor-pointer hover:opacity-90 transition"
                  />
                ))}
              </div>
            )}

            {/* Markdown Output */}
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-slate-100 my-4 pb-1 border-b border-white/10">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-slate-100 my-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-slate-200 my-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-slate-300 leading-relaxed last:mb-0">
                    {children}
                  </p>
                ),
                a: ({ href, children }) => {
                  const isDownloadLink =
                    Array.isArray(children) &&
                    String(children[0]).toLowerCase().includes("download");

                  if (isDownloadLink) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 my-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium text-xs transition border border-indigo-400/30"
                      >
                        <Download size={13} />
                        {children}
                      </a>
                    );
                  }

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
                img: ({ src, alt }) => (
                  <div className="relative group my-4 rounded-2xl overflow-hidden border border-white/10 bg-black/40 max-w-lg">
                    <img
                      src={src}
                      alt={alt || "Generated Output"}
                      loading="lazy"
                      onClick={() => setSelectedImg(src)}
                      className="w-full h-auto max-h-105 object-cover cursor-pointer group-hover:scale-[1.01] transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImg(src);
                        }}
                        className="pointer-events-auto p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition cursor-pointer"
                        title="Expand View"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <a
                        href={src}
                        target="_blank"
                        download="generated-image.png"
                        rel="noopener noreferrer"
                        className="pointer-events-auto p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl backdrop-blur-md transition cursor-pointer"
                        title="Download Image"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
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
                  <div className="overflow-x-auto my-4 rounded-2xl border border-white/10">
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
                  <th className="px-4 py-2.5 font-semibold text-slate-200">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2.5 text-slate-300">{children}</td>
                ),
                code: ({ className, children, ...props }) => {
                  const value = String(children).replace(/\n$/, "");
                  const match = /language-(\w+)/.exec(className || "");

                  if (match) {
                    return <CodeBlock language={match[1]} codeString={value} />;
                  }

                  return (
                    <code
                      className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-white/5"
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
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedImg(null)}
              className="absolute -top-12 right-0 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <img
              src={selectedImg}
              alt="Expanded view"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />

            <div className="flex items-center gap-3 mt-4">
              <a
                href={selectedImg}
                target="_blank"
                download="generated-image.png"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition shadow-lg"
              >
                <Download size={14} />
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
