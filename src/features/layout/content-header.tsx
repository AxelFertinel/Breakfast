import { SiteConfig } from "@/site-config";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "../auth/auth-button";
import { ContentNav } from "./content-nav";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/posts", label: "Blog" },
  { href: "/changelog", label: "Changelog" },
];

export function ContentHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={SiteConfig.appIcon}
              alt={SiteConfig.title}
              width={32}
              height={32}
              className="size-8"
            />
            <span className="text-lg font-bold">{SiteConfig.title}</span>
          </Link>

          <ContentNav navItems={navItems} />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AuthButton />
          </div>
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
