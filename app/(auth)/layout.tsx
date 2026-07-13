import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { defaultSiteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <EqualizerLoader size="sm" />
          <span className="font-display text-lg">{defaultSiteConfig.siteName}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
