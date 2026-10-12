export const storeLatitude = 37.250805015534795;
export const storeLongitude = 55.1845741520782;
export const neshanWebUrl = `https://neshan.org/maps/share/${storeLatitude},${storeLongitude}`;

export function getNeshanLocationUrl(userAgent: string): string {
  if (/Android/i.test(userAgent)) {
    return `intent://nshn.ir/?lat=${storeLatitude}&lng=${storeLongitude}#Intent;scheme=https;package=org.rajman.neshan.traffic.tehran.navigator;S.browser_fallback_url=${encodeURIComponent(neshanWebUrl)};end`;
  }
  return neshanWebUrl;
}
