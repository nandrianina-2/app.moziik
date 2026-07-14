import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/siteConfig";
import { requireAdmin } from "@/lib/requireAdmin";
import { withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async () => {
  await requireAdmin();
  const config = await getSiteConfig();
  return NextResponse.json({ config });
});

export const PATCH = withApiErrors(async (req: Request) => {
  await requireAdmin();

  const updates = await req.json();
  const config = await getSiteConfig();

  const allowed = [
    "siteName",
    "tagline",
    "logoUrl",
    "supportEmail",
    "copyrightText",
    "plans",
    "payPerListenRateUSD",
    "defaultTheme",
  ] as const satisfies readonly (keyof typeof config)[];

  for (const key of allowed) {
    if (key in updates) {
      (config[key] as unknown) = updates[key];
    }
  }
  config.updatedAt = new Date();
  await config.save();

  return NextResponse.json({ config });
});