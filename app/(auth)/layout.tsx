"use client";

import Image from "next/image";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useSiteConfig } from "@/context/SiteConfigProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = useSiteConfig();

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          {siteConfig.logoUrl ? (
            <Image src={siteConfig.logoUrl} alt="" width={28} height={28} className="h-7 w-7 object-contain" priority />
          ) : (
            <EqualizerLoader size="sm" />
          )}
          <span className="font-display text-lg">{siteConfig.siteName}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
