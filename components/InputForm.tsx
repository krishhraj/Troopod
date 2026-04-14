"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Link, FileText, AlertCircle } from "lucide-react";
import { LoadingStage } from "@/types";
import { LoadingOrb } from "./LoadingOrb";

interface InputFormProps {
  onSubmit: (adCreative: string, url: string) => void;
  loadingStage: LoadingStage;
  error?: string;
}

const PLACEHOLDER_AD = `🚀 Stop losing leads to slow follow-up.

Growpilot's AI responds to every new lead in under 60 seconds — 24/7, no human needed. 

Companies using Growpilot close 3x more deals from the same ad spend.

Try it free for 14 days →`;

const PLACEHOLDER_URL = "https://example.com";

export function InputForm({ onSubmit, loadingStage, error }: InputFormProps) {
  const [adCreative, setAdCreative] = useState("");
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState({ ad: false, url: false });

  const isLoading = !["idle", "done", "error"].includes(loadingStage);
  const isValid = adCreative.trim().length > 10 && url.trim().startsWith("http");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ ad: true, url: true });
    if (isValid && !isLoading) {
      onSubmit(adCreative.trim(), url.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ad Creative Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-walnut-600 font-sans">
            <FileText className="w-4 h-4 text-amber-cta" strokeWidth={1.5} />
            Ad Creative / Hook
          </label>
          <div className="relative">
            <textarea
              value={adCreative}
              onChange={(e) => setAdCreative(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, ad: true }))}
              placeholder={PLACEHOLDER_AD}
              rows={6}
              disabled={isLoading}
              className="japandi-input w-full rounded-xl px-4 py-3 text-sm text-walnut-600 font-sans resize-none placeholder:text-walnut-300 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {touched.ad && adCreative.trim().length < 10 && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Please enter your ad creative (at least 10 characters).
              </p>
            )}
          </div>
          <p className="text-xs text-walnut-400">
            Paste your ad copy, headline, or hook. The more context, the better the message-match.
          </p>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-walnut-600 font-sans">
            <Link className="w-4 h-4 text-amber-cta" strokeWidth={1.5} />
            Landing Page URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, url: true }))}
              placeholder={PLACEHOLDER_URL}
              disabled={isLoading}
              className="japandi-input w-full rounded-xl px-4 py-3 text-sm text-walnut-600 font-sans placeholder:text-walnut-300 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {touched.url && !url.trim().startsWith("http") && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Please enter a valid URL starting with https://
              </p>
            )}
          </div>
          <p className="text-xs text-walnut-400">
            The page must be publicly accessible. No auth-gated pages.
          </p>
        </div>

        {/* Error banner */}
        {error && loadingStage === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold text-red-700">Something went wrong</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="glass-panel rounded-2xl">
            <LoadingOrb stage={loadingStage} />
          </div>
        ) : (
          <motion.button
            type="submit"
            disabled={!isValid}
            className="btn-cta w-full py-4 rounded-xl text-white font-semibold font-sans flex items-center justify-center gap-2 text-base disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            <Wand2 className="w-5 h-5" strokeWidth={1.5} />
            Generate Optimized Page
          </motion.button>
        )}
      </form>
    </motion.div>
  );
}
