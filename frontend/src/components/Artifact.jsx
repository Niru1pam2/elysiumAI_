import {
  Check,
  Code2,
  CopyIcon,
  Eye,
  FileCode,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import Editor from "@monaco-editor/react";

export default function Artifact() {
  const { artifacts } = useSelector((state) => state.message);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("code"); // "code" | "preview"
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!artifacts || artifacts.length === 0) return null;

  const currentArtifact = artifacts[0];
  const files = currentArtifact?.files || [];
  const currentFile = files[selectedFileIndex] || files[0];

  // Combine HTML, CSS, and JS into a single bundle for live preview
  const getCombinedPreviewHtml = () => {
    const htmlFile = files.find((f) => f.name.endsWith(".html"))?.content || "";
    const cssFile = files.find((f) => f.name.endsWith(".css"))?.content || "";
    const jsFile = files.find((f) => f.name.endsWith(".js"))?.content || "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssFile}</style>
        </head>
        <body>
          ${htmlFile}
          <script>${jsFile}</script>
        </body>
      </html>
    `;
  };

  const handleCopy = () => {
    if (!currentFile?.content) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguage = (fileName = "") => {
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".js") || fileName.endsWith(".jsx"))
      return "javascript";
    if (fileName.endsWith(".ts") || fileName.endsWith(".tsx"))
      return "typescript";
    if (fileName.endsWith(".json")) return "json";
    return "plaintext";
  };

  return (
    <motion.div
      initial={{ width: 400 }}
      animate={{ width: collapsed ? 56 : 400 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="hidden lg:flex flex-col h-full border-l border-white/10 bg-[#0d0f14] text-white shrink-0 overflow-hidden relative"
    >
      {/* Top Bar Header */}
      <div className="h-14 px-3.5 border-b border-white/10 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
            title={collapsed ? "Expand Panel" : "Collapse Panel"}
          >
            {collapsed ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelRightClose size={18} />
            )}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <Code2 className="text-indigo-400" size={13} />
              </div>
              <span className="text-[13px] font-medium text-slate-200 truncate">
                {currentArtifact?.title || "Generated Artifact"}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Copy Code"
            >
              {copied ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <CopyIcon size={14} />
              )}
            </button>

            {/* Code / Preview Tab Toggle */}
            <div className="flex items-center gap-1 bg-white/4 border border-white/6 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setTab("code")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                  tab === "code"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 size={11} /> Code
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                  tab === "preview"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye size={11} /> Preview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Panel Body */}
      {!collapsed && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#090b0e]">
          {tab === "code" ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* File Tabs Bar */}
              {files.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-white/2 overflow-x-auto scrollbar-none">
                  {files.map((file, idx) => {
                    const isActive = selectedFileIndex === idx;
                    return (
                      <button
                        key={file.name || idx}
                        type="button"
                        onClick={() => setSelectedFileIndex(idx)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? "bg-white/10 text-indigo-300 border border-white/10"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <FileCode size={12} />
                        <span>{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Code Viewer Container */}
              <div className="flex-1 min-h-0 pt-2">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={getLanguage(currentFile?.name)}
                  value={currentFile?.content || "// No code available"}
                  options={{
                    readOnly: true, // Set to false if you want user editable code
                    minimap: { enabled: false }, // Disables the right-side minimap for clean UI
                    fontSize: 12.5,
                    fontFamily: "monospace",
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                    automaticLayout: true,
                    lineNumbersMinChars: 3,
                  }}
                />
              </div>
            </div>
          ) : (
            /* Preview iFrame Container */
            <div className="flex-1 w-full h-full bg-white">
              <iframe
                title="Artifact Live Preview"
                srcDoc={getCombinedPreviewHtml()}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      )}

      {/* Collapsed State Bar */}
      {collapsed && (
        <div
          className="flex-1 overflow-y-auto p-3 flex items-center justify-center text-slate-500 font-medium text-xs tracking-wide select-none"
          style={{ writingMode: "vertical-lr" }}
        >
          <p className="text-center truncate">{currentArtifact?.title}</p>
        </div>
      )}
    </motion.div>
  );
}
