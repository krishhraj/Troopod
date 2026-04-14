"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ArrowUpRight, Shield, Zap } from "lucide-react";
import { ApiResponse, LoadingStage, PersonalizationResult } from "@/types";
import { InputForm } from "@/components/InputForm";
import { ResultsPanel } from "@/components/ResultsPanel";

const STAGE_SEQUENCE: LoadingStage[] = [
  "scraping",
  "parsing",
  "analyzing",
  "personalizing",
  "rendering",
];

export default function Home() {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<PersonalizationResult | null>(null);
  const [personalizedHtml, setPersonalizedHtml] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const advanceStages = useCallback((onDone: () => void) => {
    let i = 0;
    const delays = [0, 800, 1600, 2800, 4200];
    STAGE_SEQUENCE.forEach((stage, idx) => {
      setTimeout(() => {
        setLoadingStage(stage);
        i = idx;
        if (idx === STAGE_SEQUENCE.length - 1) {
          // "rendering" stage — wait for actual API
        }
      }, delays[idx]);
    });
    return i;
  }, []);

  const handleSubmit = useCallback(
    async (adCreative: string, url: string) => {
      setError("");
      setResult(null);
      setPersonalizedHtml("");
      setCurrentUrl(url);

      // Start visual stage progression
      advanceStages(() => {});

      try {
        const res = await fetch("/api/personalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adCreative, landingPageUrl: url }),
        });

        const data: ApiResponse = await res.json();

        if (!data.success || !data.data) {
          setError(data.error || "An unexpected error occurred.");
          setLoadingStage("error");
          return;
        }

        // Ensure we stay on "rendering" briefly
        setTimeout(() => {
          setResult(data.data!);
          setPersonalizedHtml(data.scrapedHtml || "");
          setLoadingStage("done");
        }, 600);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setError(msg);
        setLoadingStage("error");
      }
    },
    [advanceStages]
  );

  const handleReset = () => {
    setLoadingStage("idle");
    setResult(null);
    setError("");
    setPersonalizedHtml("");
    setCurrentUrl("");
  };

  const showResults = loadingStage === "done" && result;

  return (
    <div className="min-h-screen relative" style={{ background: "var(--sand)" }}>
      {/* Background gradient mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(92,64,51,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(46,79,79,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #c8941a, #5c4033)",
                  boxShadow: "0 4px 12px rgba(200,148,26,0.35)",
                }}
              >
                <Layers className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-walnut-600 leading-tight">
                  Troopod
                </h1>
                <p className="text-xs text-walnut-400 font-sans">
                  CRO-Driven Ad Match Engine
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { icon: Shield, label: "No HTML injection" },
                { icon: Zap, label: "Deterministic AI" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="glass-panel flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-walnut-500 font-sans"
                >
                  <Icon className="w-3 h-3 text-forest-400" strokeWidth={1.5} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-walnut-600 leading-tight">
              Turn ad clicks into{" "}
              <span
                className="italic"
                style={{
                  background: "linear-gradient(135deg, #c8941a, #5c4033)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                conversions
              </span>
            </h2>
            <p className="mt-3 text-walnut-400 font-sans text-base leading-relaxed">
              Paste your ad creative and a landing page URL. The engine scrapes the page,
              identifies key conversion elements, and rewrites them to perfectly match your
              ad's message — using strict CRO principles.
            </p>
          </div>
        </motion.header>

        {/* Main layout */}
        <div className={`grid gap-6 ${showResults ? "lg:grid-cols-2" : "max-w-2xl"}`}>
          {/* Left: Input */}
          <div>
            <div className="wood-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-base font-semibold text-walnut-600">
                  Input
                </h3>
                {showResults && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-walnut-400 hover:text-walnut-600 font-sans flex items-center gap-1 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    New analysis
                  </button>
                )}
              </div>
              <InputForm
                onSubmit={handleSubmit}
                loadingStage={loadingStage}
                error={error}
              />
            </div>

            {/* Feature callouts — only show when idle */}
            <AnimatePresence>
              {loadingStage === "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 grid grid-cols-3 gap-3"
                >
                  {[
                    {
                      title: "Message Match",
                      desc: "Ad → Page continuity that boosts Quality Score",
                    },
                    {
                      title: "Zero Layout Risk",
                      desc: "Only text is rewritten — design stays intact",
                    },
                    {
                      title: "Fact-Safe AI",
                      desc: "No hallucinations — only what's on the page",
                    },
                  ].map((f) => (
                    <div key={f.title} className="glass-panel rounded-xl p-3">
                      <p className="text-xs font-semibold text-walnut-600 font-sans mb-0.5">
                        {f.title}
                      </p>
                      <p className="text-xs text-walnut-400 font-sans leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Results */}
          <AnimatePresence>
            {showResults && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="wood-card rounded-2xl p-6"
              >
                <ResultsPanel
                  result={result}
                  personalizedHtml={personalizedHtml}
                  originalUrl={currentUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-xs text-walnut-300 font-sans"
        >
          Built and Designed by Krish Raj.
        </motion.footer>
      </div>
    </div>
  );
}
