import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/siteConfig";
import { withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async () => {
  const config = await getSiteConfig();
  return NextResponse.json({
    siteName: config.siteName,
    tagline: config.tagline,
    logoUrl: config.logoUrl,
    supportEmail: config.supportEmail,
    copyrightText: config.copyrightText,
    plans: config.plans,
  });
});
