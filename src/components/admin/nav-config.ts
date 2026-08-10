export type NavItem = {
  label: string;
  href: string;
};

export const adminNavConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    label: 'Question Pool',
    href: '/admin/pool',
  },
  {
    label: 'Team Qualifiers',
    href: '/admin/qualifiers',
  },
  // Future phases will add Timer Settings, Round Control, and Leaderboard here.
];
