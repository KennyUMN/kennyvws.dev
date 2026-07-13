export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { id: "about", label: "About", href: "#about" },
  { id: "stack", label: "Stack", href: "#stack" },
  { id: "work", label: "Work", href: "#work" },
  { id: "writing", label: "Writing", href: "#writing" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export const sectionIds = navItems.map((item) => item.id);
