import Groq from "groq-sdk";
import { PageElements, PersonalizationResult } from "@/types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an elite Conversion Rate Optimization (CRO) specialist and direct-response copywriter.

Your task: Given an ad creative and the extracted text elements from a landing page, rewrite ONLY the specified text elements so the landing page copy precisely matches the ad's message, hook, and intent.

## STRICT RULES — NEVER VIOLATE:

1. **FACT FIDELITY**: Only use facts, features, benefits, and claims that exist in either the original page content OR the ad creative. NEVER invent new features, statistics, or claims.
2. **STRUCTURE PRESERVATION**: Only return the JSON structure specified. Do NOT include HTML tags, CSS classes, markdown, or any formatting — plain text values only.
3. **MESSAGE MATCH**: The rewritten copy must mirror the ad's hook, tone, and specific promise to create a seamless transition from ad click to landing page.
4. **ELEMENT SCOPE**: Only rewrite the exact elements provided. Do not add new elements or omit any.
5. **LENGTH DISCIPLINE**: Keep rewritten text within ±20% of the original word count for each element. Headlines stay punchy.
6. **NO HALLUCINATION**: If an element cannot be meaningfully improved given the ad context, keep it close to the original with minor refinements.

## OUTPUT FORMAT (strict JSON only — no preamble, no explanation):
{
  "title": "<rewritten page title>",
  "h1": "<rewritten main headline>",
  "subheadings": ["<rewritten sub1>", "<rewritten sub2>", ...],
  "ctaTexts": ["<rewritten cta1>", ...],
  "metaDescription": "<rewritten meta description>",
  "changes": [
    {
      "element": "h1",
      "original": "<original text>",
      "personalized": "<new text>",
      "reason": "<brief CRO rationale>"
    }
  ],
  "cro_insights": [
    "<insight 1 about message match>",
    "<insight 2 about conversion improvement>"
  ]
}`;

export async function personalizePageElements(
  adCreative: string,
  pageElements: PageElements
): Promise<PersonalizationResult> {
  const userMessage = `## AD CREATIVE:
${adCreative}

## ORIGINAL PAGE ELEMENTS TO REWRITE:
- Title: ${pageElements.title}
- H1: ${pageElements.h1}
- Subheadings: ${JSON.stringify(pageElements.subheadings)}
- CTA Button Texts: ${JSON.stringify(pageElements.ctaTexts)}
- Meta Description: ${pageElements.metaDescription}

Rewrite these elements to create perfect message-match with the ad creative. Return ONLY the JSON object.`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1500,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const rawText = response.choices[0]?.message?.content || "";

  // Strip any accidental markdown fences
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  // Extract JSON object even if there's surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in response. Raw: " + cleaned.slice(0, 300));
  }

  let parsed: {
    title: string;
    h1: string;
    subheadings: string[];
    ctaTexts: string[];
    metaDescription: string;
    changes: PersonalizationResult["changes"];
    cro_insights: string[];
  };

  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Failed to parse JSON from LLM response. Raw: " + cleaned.slice(0, 300));
  }

  // Safety rail: reject any HTML tags in output values
  const htmlTagRegex = /<[^>]+>/;
  const allTextValues = [
    parsed.title,
    parsed.h1,
    ...(parsed.subheadings || []),
    ...(parsed.ctaTexts || []),
    parsed.metaDescription,
  ].filter(Boolean);

  for (const val of allTextValues) {
    if (htmlTagRegex.test(val)) {
      throw new Error(`Safety violation: HTML tags detected in LLM output: "${val}"`);
    }
  }

  return {
    original: pageElements,
    personalized: {
      title: parsed.title || pageElements.title,
      h1: parsed.h1 || pageElements.h1,
      subheadings: parsed.subheadings?.length ? parsed.subheadings : pageElements.subheadings,
      ctaTexts: parsed.ctaTexts?.length ? parsed.ctaTexts : pageElements.ctaTexts,
      metaDescription: parsed.metaDescription || pageElements.metaDescription,
    },
    changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    cro_insights: Array.isArray(parsed.cro_insights) ? parsed.cro_insights : [],
  };
}
