import * as cheerio from "cheerio";
import { PageElements } from "@/types";

export async function scrapePage(url: string): Promise<{ elements: PageElements; html: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LandingPersonalizer/1.0; +https://github.com/personalizer)",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove script/style noise
  $("script, style, noscript, iframe").remove();

  const title = $("title").first().text().trim() || "";
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const h1 =
    $("h1")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim() || "";

  // Collect subheadings — h2, strong hero <p>s, hero subtitles
  const subheadings: string[] = [];
  $("h2, h3").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 5 && text.length < 200 && !subheadings.includes(text)) {
      subheadings.push(text);
    }
  });

  // Collect CTA button texts
  const ctaTexts: string[] = [];
  const ctaSelectors = [
    'a[class*="btn"]',
    'a[class*="button"]',
    'a[class*="cta"]',
    'button[class*="btn"]',
    'button[class*="primary"]',
    'button[class*="cta"]',
    'button[type="submit"]',
    ".cta a",
    "[data-cta]",
  ];

  ctaSelectors.forEach((sel) => {
    $(sel).each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text && text.length > 1 && text.length < 80 && !ctaTexts.includes(text)) {
        ctaTexts.push(text);
      }
    });
  });

  // Fallback CTA: any prominent button
  if (ctaTexts.length === 0) {
    $("button, a").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      const cls = ($(el).attr("class") || "").toLowerCase();
      if (
        text &&
        text.length > 1 &&
        text.length < 60 &&
        !ctaTexts.includes(text) &&
        (cls.includes("primary") || cls.includes("submit") || cls.includes("action"))
      ) {
        ctaTexts.push(text);
      }
    });
  }

  return {
    elements: {
      title,
      h1,
      subheadings: subheadings.slice(0, 5),
      ctaTexts: ctaTexts.slice(0, 4),
      metaDescription,
    },
    html,
  };
}

/**
 * Injects personalized text back into the HTML safely,
 * only replacing text nodes — never touching HTML attributes or tags.
 */
export function injectPersonalizedContent(
  html: string,
  original: PageElements,
  personalized: PageElements
): string {
  const $ = cheerio.load(html);

  // Replace title
  if (personalized.title && original.title) {
    $("title").text(personalized.title);
  }

  // Replace h1 — text node only, preserve all classes/attributes
  if (personalized.h1 && original.h1) {
    $("h1").first().each((_, el) => {
      const $el = $(el);
      // Only replace if the text content matches (safety check)
      if ($el.text().replace(/\s+/g, " ").trim() === original.h1) {
        $el.text(personalized.h1);
      }
    });
  }

  // Replace subheadings
  personalized.subheadings.forEach((newText, i) => {
    const origText = original.subheadings[i];
    if (!origText || !newText) return;
    $("h2, h3").each((_, el) => {
      const $el = $(el);
      if ($el.text().replace(/\s+/g, " ").trim() === origText) {
        $el.text(newText);
        return false; // break
      }
    });
  });

  return $.html();
}
