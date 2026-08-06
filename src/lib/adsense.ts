export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";

export const ADSENSE_SLOTS = {
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
  inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT ?? "",
  postAction: process.env.NEXT_PUBLIC_ADSENSE_SLOT_POST_ACTION ?? "",
  mobileBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE ?? "",
} as const;

export type AdSlotKey = keyof typeof ADSENSE_SLOTS;

export function isAdSenseEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT_ID);
}

export function isAdSlotConfigured(slot: AdSlotKey): boolean {
  return isAdSenseEnabled() && Boolean(ADSENSE_SLOTS[slot]);
}
