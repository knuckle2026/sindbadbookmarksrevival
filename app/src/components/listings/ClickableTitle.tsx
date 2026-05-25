"use client";

interface ClickableTitleProps {
  listingId: string;
  title: string;
  websiteUrl: string | null;
}

type SocialKind = "x" | "instagram" | null;

function detectSocial(url: string | null): SocialKind {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "x.com" || host === "twitter.com" || host.endsWith(".x.com") || host.endsWith(".twitter.com")) return "x";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  } catch {
    /* ignore invalid URLs */
  }
  return null;
}

function XIcon() {
  return (
    <svg
      role="img"
      aria-label="X"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block h-[1em] w-[1em] align-[-0.125em]"
    >
      <path d="M18.244 2H21.5l-7.55 8.63L23 22h-6.844l-5.36-7.01L4.6 22H1.34l8.07-9.22L1 2h6.94l4.85 6.41L18.244 2Zm-2.4 18h1.86L7.27 4H5.27l10.574 16Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      role="img"
      aria-label="Instagram"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block h-[1em] w-[1em] align-[-0.125em]"
    >
      <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.054 1.805.247 2.227.41.56.218.96.479 1.38.9.42.42.682.82.9 1.38.163.422.356 1.057.41 2.227.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.247 1.805-.41 2.227a3.71 3.71 0 0 1-.9 1.38 3.71 3.71 0 0 1-1.38.9c-.422.163-1.057.356-2.227.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.247-2.227-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.163-.422-.356-1.057-.41-2.227C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.054-1.17.247-1.805.41-2.227.218-.56.479-.96.9-1.38.42-.42.82-.682 1.38-.9.422-.163 1.057-.356 2.227-.41C8.416 2.212 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.51.012-4.74.068-.99.045-1.527.21-1.884.349a3.07 3.07 0 0 0-1.14.74 3.07 3.07 0 0 0-.74 1.14c-.139.357-.304.894-.349 1.884C3.012 9.49 3 9.85 3 13s.012 3.51.068 4.74c.045.99.21 1.527.349 1.884.18.46.4.788.74 1.14.352.34.68.56 1.14.74.357.139.894.304 1.884.349 1.23.056 1.59.068 4.74.068s3.51-.012 4.74-.068c.99-.045 1.527-.21 1.884-.349.46-.18.788-.4 1.14-.74.34-.352.56-.68.74-1.14.139-.357.304-.894.349-1.884.056-1.23.068-1.59.068-4.74s-.012-3.51-.068-4.74c-.045-.99-.21-1.527-.349-1.884a3.07 3.07 0 0 0-.74-1.14 3.07 3.07 0 0 0-1.14-.74c-.357-.139-.894-.304-1.884-.349C15.51 4.012 15.15 4 12 4Zm0 3.378a4.622 4.622 0 1 1 0 9.244 4.622 4.622 0 0 1 0-9.244Zm0 1.8a2.822 2.822 0 1 0 0 5.644 2.822 2.822 0 0 0 0-5.644Zm5.842-2.04a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0Z" />
    </svg>
  );
}

function SocialIcon({ kind }: { kind: SocialKind }) {
  if (kind === "x") return <XIcon />;
  if (kind === "instagram") return <InstagramIcon />;
  return null;
}

export default function ClickableTitle({
  listingId,
  title,
  websiteUrl,
}: ClickableTitleProps) {
  const social = detectSocial(websiteUrl);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Fire and forget - don't block navigation
    fetch(`/api/listings/${listingId}/click`, { method: "POST" }).catch(
      () => {},
    );

    // LINE のアプリ内ブラウザは target="_blank" を内部 webview で開いてしまう。
    // LINE 固有の `?openExternalBrowser=1` パラメータを付けると、LINE が
    // 自動的に外部ブラウザ (Safari / Chrome) で開いてくれる。
    if (!websiteUrl) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (/Line\//i.test(ua)) {
      e.preventDefault();
      const separator = websiteUrl.includes("?") ? "&" : "?";
      window.location.href = `${websiteUrl}${separator}openExternalBrowser=1`;
    }
  };

  if (websiteUrl) {
    return (
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block text-base font-semibold hover:underline active:opacity-70"
        style={{ color: "#005766" }}
      >
        {title}
        {social && <> <SocialIcon kind={social} /></>}
      </a>
    );
  }

  return (
    <span className="block text-base font-semibold" style={{ color: "#005766" }}>
      {title}
    </span>
  );
}
