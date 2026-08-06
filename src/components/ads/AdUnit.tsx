"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS, isAdSlotConfigured, type AdSlotKey } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type AdUnitProps = {
  slot: AdSlotKey;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  className?: string;
  minHeight?: number;
  reloadKey?: string | number;
};

export function AdUnit({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  className = "",
  minHeight = 90,
  reloadKey,
}: AdUnitProps) {
  const pushedRef = useRef(false);
  const slotId = ADSENSE_SLOTS[slot];

  useEffect(() => {
    if (!isAdSlotConfigured(slot)) return;

    pushedRef.current = false;

    const timer = window.setTimeout(() => {
      if (pushedRef.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // AdSense script may not be loaded yet in dev
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [slot, reloadKey]);

  if (!isAdSlotConfigured(slot)) {
    return null;
  }

  return (
    <div className={`overflow-hidden ${className}`} style={{ minHeight }}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
