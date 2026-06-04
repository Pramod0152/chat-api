export const allowedOriginPatterns: RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)*taasnet\.com$/,
  /^https?:\/\/stagelink\.live$/,
  /^https?:\/\/([a-z0-9-]+\.)*taascard\.com$/,
  /^https?:\/\/([a-z0-9-]+\.)*airbank\.one$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
];

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
}
