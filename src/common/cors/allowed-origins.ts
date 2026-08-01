export function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests with no origin (like Postman, Swagger UI, or server-to-server)
  if (!origin) {
    return true;
  }

  // Read allowed origins dynamically from environment variable (comma-separated)
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    const allowedList = envOrigins.split(',').map((o) => o.trim());

    for (const allowed of allowedList) {
      if (allowed === '*' || origin === allowed) {
        return true;
      }
      // Support wildcard subdomains if needed (e.g., *.onrender.com or *.taasnet.com)
      if (allowed.startsWith('*.')) {
        const domainSuffix = allowed.slice(1);
        if (origin.endsWith(domainSuffix) || origin === domainSuffix.slice(1)) {
          return true;
        }
      }
    }
  }

  // Strict default fallback: only allow local development environments
  const defaultPatterns: RegExp[] = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/127\.0\.0\.1(:\d+)?$/];

  return defaultPatterns.some((pattern) => pattern.test(origin));
}
