import { NextRequest, NextResponse } from "next/server";
import { scrapePage, injectPersonalizedContent } from "@/lib/scraper";
import { personalizePageElements } from "@/lib/personalizer";
import { ApiResponse } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adCreative, landingPageUrl } = body;

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

    // Validate URL
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

    // Step 1: Scrape
    let elements, html;
    try {
      ({ elements, html } = await scrapePage(parsedUrl.toString()));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown scrape error";
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Could not fetch the landing page. ${msg}. Make sure the URL is publicly accessible.`,
        },
        { status: 422 }
      );
    }

    if (!elements.h1 && !elements.title) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Could not extract meaningful content from this page. Try a different URL.",
        },
        { status: 422 }
      );
    }

    // Step 2: Personalize via LLM
    let result;
    try {
      result = await personalizePageElements(adCreative, elements);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "LLM error";
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Personalization failed: ${msg}` },
        { status: 500 }
      );
    }

    // Step 3: Inject personalized content back into the HTML
    const personalizedHtml = injectPersonalizedContent(html, elements, result.personalized);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      scrapedHtml: personalizedHtml,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json<ApiResponse>(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
