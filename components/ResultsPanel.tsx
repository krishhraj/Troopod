"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, GitCompare, Download, ExternalLink, CheckCircle2 } from "lucide-react";
import { PersonalizationResult } from "@/types";
import { BeforeAfterDiff } from "./BeforeAfterDiff";

interface ResultsPanelProps {
  result: PersonalizationResult;
  personalizedHtml: string;
  originalUrl: string;
}

type Tab = "preview" | "diff";

export function ResultsPanel({ result, personalizedHtml, originalUrl }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("diff");
  const [copied, setCopied] = useState(false);

  const changeCount = result.changes.length;

  const handleDownload = () => {
    const blob = new Blob([personalizedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personalized-landing-page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(personalizedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iframeSrcDoc = personalizedHtml;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-forest-400" strokeWidth={1.5} />
            <h2 className="font-serif text-xl text-walnut-600 font-semibold">
              Personalization Complete
            </h2>
          </div>
          <p className="text-sm text-walnut-400 font-sans">
            {changeCount} element{changeCount !== 1 ? "s" : ""} optimized for message-match
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <motion.button
            onClick={handleCopyHtml}
            whileTap={{ scale: 0.96 }}
            className="glass-panel px-3 py-2 rounded-lg text-xs font-semibold text-walnut-600 font-sans flex items-center gap-1.5 hover:border-walnut-300 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-400" strokeWidth={2} />
                Copied!
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                Copy HTML
              </>
            )}
          </motion.button>
          <motion.button
            onClick={handleDownload}
            whileTap={{ scale: 0.96 }}
            className="btn-cta px-3 py-2 rounded-lg text-xs font-semibold text-white font-sans flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            Download
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-panel rounded-xl p-1">
        {(
          [
            { id: "diff" as Tab, label: "Before & After", icon: GitCompare },
            { id: "preview" as Tab, label: "Live Preview", icon: Eye },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold font-sans transition-all ${
              activeTab === id
                ? "bg-walnut-500 text-white shadow-wood"
                : "text-walnut-500 hover:text-walnut-600"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "diff" ? (
          <motion.div
            key="diff"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.25 }}
          >
            <BeforeAfterDiff result={result} />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 p-3 glass-panel rounded-xl">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white/60 rounded-md px-3 py-1 text-xs text-walnut-400 font-sans truncate">
                {originalUrl} — personalized preview
              </div>
            </div>
            <div className="iframe-wrapper glass-panel rounded-2xl overflow-hidden border border-walnut-100">
              <iframe
                srcDoc={iframeSrcDoc}
                title="Personalized Landing Page Preview"
                sandbox="allow-same-origin"
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-walnut-400 text-center font-sans">
              ↑ Live preview of the personalized page with CRO-optimized copy injected
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
