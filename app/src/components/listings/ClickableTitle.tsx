"use client";

interface ClickableTitleProps {
  listingId: string;
  title: string;
  websiteUrl: string | null;
}

export default function ClickableTitle({
  listingId,
  title,
  websiteUrl,
}: ClickableTitleProps) {
  const handleClick = () => {
    // Fire and forget - don't block navigation
    fetch(`/api/listings/${listingId}/click`, { method: "POST" }).catch(
      () => {},
    );
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
      </a>
    );
  }

  return (
    <span className="block text-base font-semibold" style={{ color: "#005766" }}>
      {title}
    </span>
  );
}
