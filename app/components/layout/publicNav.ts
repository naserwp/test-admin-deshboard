export const PUBLIC_CONTAINER = "mx-auto max-w-7xl px-6";
export const PUBLIC_HEADER_HEIGHT = "88px";

export type PublicNavItem = {
  id: "home" | "pricing" | "faq" | "blog" | "agency";
  label: string;
  href: string;
};

export type PublicNavGroup = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

export const publicHomeItem: PublicNavItem = {
  id: "home",
  label: "Home",
  href: "/",
};

export const publicTopNavItems: PublicNavItem[] = [
  { id: "pricing", label: "Pricing", href: "/pricing" },
  { id: "faq", label: "FAQ", href: "/#faq" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "agency", label: "Agency", href: "/agency" },
];

export const publicProductItems = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
];

export const publicNavItems: PublicNavGroup[] = [
  {
    title: "Product",
    items: [
      { label: "Overview", href: "/" },
      { label: "Features", href: "/features" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Security", href: "/security" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Agency", href: "/agency" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Status", href: "/status" },
    ],
  },
];

export const publicFooterGroups = publicNavItems;
