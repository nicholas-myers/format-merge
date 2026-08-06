import Script from "next/script";
import { ADSENSE_CLIENT_ID, isAdSenseEnabled } from "@/lib/adsense";

export function AdSenseScript() {
  if (!isAdSenseEnabled()) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
