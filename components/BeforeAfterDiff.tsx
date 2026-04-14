"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { PersonalizationResult } from "@/types";

interface BeforeAfterDiffProps {
  result: PersonalizationResult;
}

const ELEMENT_LABELS: Record<string, string> = {
  title: "Page Title",
  h1: "Main Headline (H1)",
  subheadings: "Subheadings",
  ctaTexts: "CTA Buttons",
  metaDescription: "Meta Description",
};

export function BeforeAfterDiff({ result }: BeforeAfterDiffProps) {
  const { changes, cro_insights } = result;

  return (
    <div className="space-y-6">
      {/* CRO Insights */}
      {cro_insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-dark rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <h3 className="font-serif text-sm font-semibold text-forest-500">
              CRO Insights
            </h3>
          </div>
          <ul className="space-y-2">
            {cro_insights.map((insight, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-2 text-sm text-walnut-600"
              >
                <TrendingUp className="w-3.5 h-3.5 mt-0.5 text-forest-400 flex-shrink-0" strokeWidth={1.5} />
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Changes diff */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          <h3 className="font-serif text-sm font-semibold text-walnut-600">
            Element Transformations
          </h3>
        </div>

        {changes.map((change, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="wood-card rounded-xl p-4 space-y-3"
          >
            {/* Element label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-walnut-400 font-sans">
                {ELEMENT_LABELS[change.element] || change.element}
              </span>
            </div>

            {/* Before / After */}
            <div className="grid grid-cols-1 gap-2">
              {/* Before */}
              <div className="diff-removed rounded-lg px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-walnut-400 block mb-1">
                  Before
                </span>
                <p className="text-sm text-walnut-500 font-sans leading-relaxed">
                  {change.original}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
              </div>

              {/* After */}
              <div className="diff-added rounded-lg px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-400 block mb-1">
                  After
                </span>
                <p className="text-sm text-forest-600 font-sans leading-relaxed font-medium">
                  {change.personalized}
                </p>
              </div>
            </div>

            {/* Reason */}
            {change.reason && (
              <p className="text-xs text-walnut-400 italic border-t border-walnut-100 pt-2">
                💡 {change.reason}
              </p>
            )}
          </motion.div>
        ))}

        {changes.length === 0 && (
          <div className="text-center py-8 text-walnut-400 text-sm">
            No specific changes were tracked. Check the live preview below.
          </div>
        )}
      </div>
    </div>
  );
}
