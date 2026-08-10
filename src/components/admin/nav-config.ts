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
    label: 'Team Qualifiers',
    href: '/admin/qualifiers',
  },
  {
    label: 'Round 2',
    href: '/admin/controls',
  },
  {
    label: 'Question Pool',
    href: '/admin/pool',
  },
  {
    label: 'Leaderboard',
    href: '/admin/leaderboard',
  },
];