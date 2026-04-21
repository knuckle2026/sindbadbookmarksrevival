import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-24 flex h-24 shrink-0 items-center justify-center"
      style={{ backgroundColor: "#B21000" }}
    >
      <Link
        href="/operator"
        className="text-[11px] font-light text-white/90 hover:underline active:opacity-80"
      >
        運営事務局
      </Link>
    </footer>
  );
}
