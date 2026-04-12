import type { NavigationGroup } from "@/features/navigation/navigation.type";
import type { AuthRole } from "@/lib/auth/auth-permissions";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Flame,
  Heart,
  History,
  Home,
  Settings,
  ShoppingCart,
  TriangleAlert,
  UtensilsCrossed,
  User2,
  Package,
} from "lucide-react";

const replaceSlug = (href: string, slug: string): string =>
  href.replace(":organizationSlug", slug);

export const getOrganizationNavigation = (
  slug: string,
  userRoles: AuthRole[] | undefined,
): NavigationGroup[] => {
  return ORGANIZATION_LINKS.reduce<NavigationGroup[]>((acc, group) => {
    const filteredLinks = group.links
      .filter((link) => !link.roles || isInRoles(userRoles, link.roles))
      .map((link) => ({
        ...link,
        href: replaceSlug(link.href, slug),
      }));

    if (filteredLinks.length === 0) return acc;

    acc.push({
      ...group,
      defaultOpenStartPath: group.defaultOpenStartPath
        ? replaceSlug(group.defaultOpenStartPath, slug)
        : undefined,
      links: filteredLinks,
    });

    return acc;
  }, []);
};

const ORGANIZATION_PATH = `/orgs/:organizationSlug`;

export const ORGANIZATION_LINKS: NavigationGroup[] = [
  {
    title: "Petit-déjeuner",
    links: [
      {
        href: ORGANIZATION_PATH,
        Icon: Home,
        label: "Dashboard",
      },
      {
        href: `${ORGANIZATION_PATH}/dashboard`,
        Icon: Calendar,
        label: "Ma semaine",
      },
      {
        href: `${ORGANIZATION_PATH}/dashboard/recipes`,
        Icon: BookOpen,
        label: "Recettes",
      },
      {
        href: `${ORGANIZATION_PATH}/dashboard/favorites`,
        Icon: Heart,
        label: "Favoris",
      },
      {
        href: `${ORGANIZATION_PATH}/dashboard/shopping`,
        Icon: ShoppingCart,
        label: "Liste de courses",
      },
      {
        href: `${ORGANIZATION_PATH}/dashboard/history`,
        Icon: History,
        label: "Historique",
      },
    ],
  },
  {
    title: "Mon espace",
    links: [
      {
        href: `${ORGANIZATION_PATH}/stock`,
        Icon: Package,
        label: "Mon stock",
      },
      {
        href: `${ORGANIZATION_PATH}/dashboard/streaks`,
        Icon: Flame,
        label: "Mes streaks",
      },
    ],
  },
  {
    title: "Organisation",
    defaultOpenStartPath: `${ORGANIZATION_PATH}/settings`,
    links: [
      {
        href: `${ORGANIZATION_PATH}/settings`,
        Icon: Settings,
        label: "Paramètres",
        roles: ["admin"],
      },
      {
        href: `${ORGANIZATION_PATH}/settings/members`,
        Icon: User2,
        label: "Membres",
        roles: ["admin"],
      },
      {
        href: `${ORGANIZATION_PATH}/settings/billing`,
        Icon: CreditCard,
        label: "Abonnement",
        roles: ["admin"],
      },
      {
        href: `${ORGANIZATION_PATH}/settings/danger`,
        Icon: TriangleAlert,
        label: "Zone de danger",
        roles: ["owner"],
      },
    ],
  },
] satisfies NavigationGroup[];
