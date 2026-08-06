"use client";

import { usePathname } from "next/navigation";
import { MobileBannerAd, SidebarAd } from "@/components/ads/AdPlacement";

export function LayoutAds() {
  const pathname = usePathname();

  return (
    <>
      <MobileBannerAd reloadKey={pathname} />
    </>
  );
}

export function SidebarAds() {
  const pathname = usePathname();

  return <SidebarAd reloadKey={pathname} />;
}
