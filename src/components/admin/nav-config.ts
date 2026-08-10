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
  {
    label: 'Round Control',
    href: '/admin/controls',
  },
  {
    label: 'Leaderboard',
    href: '/admin/leaderboard',
  },
]