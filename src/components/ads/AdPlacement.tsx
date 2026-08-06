import { AdUnit } from "@/components/ads/AdUnit";
import type { AdSlotKey } from "@/lib/adsense";
import { isAdSlotConfigured } from "@/lib/adsense";

type AdPlacementProps = {
  slot: AdSlotKey;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  minHeight?: number;
  reloadKey?: string | number;
  className?: string;
};

function AdLabel() {
  return (
    <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-400">
      Advertisement
    </p>
  );
}

export function SidebarAd({ reloadKey }: { reloadKey?: string }) {
  if (!isAdSlotConfigured("sidebar")) return null;

  return (
    <div className="mt-8 hidden md:block">
      <AdLabel />
      <div className="sticky top-8 rounded-lg border border-zinc-100 bg-white p-2">
        <AdUnit slot="sidebar" format="vertical" minHeight={250} reloadKey={reloadKey} />
      </div>
    </div>
  );
}

export function MobileBannerAd({ reloadKey }: { reloadKey?: string }) {
  if (!isAdSlotConfigured("mobileBanner")) return null;

  return (
    <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 md:hidden">
      <AdLabel />
      <AdUnit slot="mobileBanner" format="horizontal" minHeight={60} reloadKey={reloadKey} />
    </div>
  );
}

export function InContentAd({
  slot = "inContent",
  reloadKey,
  className = "",
}: {
  slot?: AdSlotKey;
  reloadKey?: string | number;
  className?: string;
}) {
  if (!isAdSlotConfigured(slot)) return null;

  return (
    <div className={`rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-3 ${className}`}>
      <AdLabel />
      <AdUnit slot={slot} format="auto" minHeight={90} reloadKey={reloadKey} />
    </div>
  );
}

export function PostActionAd({
  visible,
  interactionKey,
}: {
  visible: boolean;
  interactionKey: string | number;
}) {
  if (!visible || !isAdSlotConfigured("postAction")) return null;

  return (
    <InContentAd slot="postAction" reloadKey={interactionKey} className="mt-4" />
  );
}

export function AdPlacement({
  slot,
  format = "auto",
  minHeight = 90,
  reloadKey,
  className = "",
}: AdPlacementProps) {
  if (!isAdSlotConfigured(slot)) return null;

  return (
    <div className={className}>
      <AdLabel />
      <AdUnit slot={slot} format={format} minHeight={minHeight} reloadKey={reloadKey} />
    </div>
  );
}
