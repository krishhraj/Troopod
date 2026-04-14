import { NextRequest, NextResponse } from "next/server";
import { scrapePage, injectPersonalizedContent } from "@/lib/scraper";
import { personalizePageElements } from "@/lib/personalizer";
import { ApiResponse } from "@/types";

export const maxDuration = 60;

// ⏱️ Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("➡️ Request received");

    const body = await req.json();
    const { adCreative, landingPageUrl } = body;

    // ✅ Validation
    if (!adCreative?.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Ad creative is required." },
        { status: 400 }
      );
    }

    if (!landingPageUrl?.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Landing page URL is required." },
        { status: 400 }
      );
    }

    // ✅ URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(landingPageUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Please enter a valid URL (include https://)." },
        { status: 400 }
      );
    }

    // =========================
    // 🟡 STEP 1: SCRAPE
    // =========================
    let elements, html;

    try {
      console.log("🌐 Starting scrape...");

      ({ elements, html } = await withTimeout(
        scrapePage(parsedUrl.toString()),
        15000 // 15 sec timeout
      ));

      console.log("✅ Scrape done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown scrape error";

      if (msg.includes("Timeout")) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Scraping timed out. Try a different URL." },
          { status: 504 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Could not fetch the landing page. ${msg}`,
        },
        { status: 422 }
      );
    }

    // ✅ Check extracted content
    if (!elements?.h1 && !elements?.title) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Could not extract meaningful content from this page.",
        },
        { status: 422 }
      );
    }

    // =========================
    // 🟡 STEP 2: PERSONALIZATION
    // =========================
    let result;

    try {
      console.log("🤖 Starting personalization...");

      result = await withTimeout(
        personalizePageElements(adCreative, elements),
        20000 // 20 sec timeout
      );

      console.log("✅ Personalization done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "LLM error";

      if (msg.includes("Timeout")) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "AI processing timed out. Try again." },
          { status: 504 }
        );
      }

      return NextResponse.json<ApiResponse>(
        { success: false, error: `Personalization failed: ${msg}` },
        { status: 500 }
      );
    }

    // =========================
    // 🟡 STEP 3: INJECT HTML
    // =========================
    const personalizedHtml = injectPersonalizedContent(
      html,
      elements,
      result.personalized
    );

    // ✅ FINAL RESPONSE
    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      scrapedHtml: personalizedHtml,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";

    console.error("❌ FINAL ERROR:", msg);

    return NextResponse.json<ApiResponse>(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
