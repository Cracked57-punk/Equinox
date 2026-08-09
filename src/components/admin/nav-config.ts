export type NavItem = {
  label: string;
  href: string;
  minTier: number;
};

export const adminNavConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    minTier: 2, // Visible to both Tier 2 and Tier 3
  },
  {
    label: 'Team Qualifiers',
    href: '/admin/qualifiers',
    minTier: 3,
  },
  // Future phases will add Question Pool, Team Qualifiers, Timer Settings, Round Control, and Leaderboard here.
];
