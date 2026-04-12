import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { AuthButton } from "../auth/auth-button";
import { HeaderBase } from "./header-base";

export function Header() {
  return (
    <HeaderBase>
      <Link
        href="/contact"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Contact
      </Link>
      <AuthButton />
    </HeaderBase>
  );
}
