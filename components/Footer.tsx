import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-sky-edge/60 bg-sky-softer">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {siteConfig.name}.{" "}
          <Link href="/feed.xml" className="hover:text-primary">
            RSS
          </Link>
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
