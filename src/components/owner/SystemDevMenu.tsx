/**
 * SystemDevMenu
 *
 * Sidebar navigation menu for the "Sistema y Desarrollo" owner portal section.
 * Renders four items: Dashboard, Gestión de Funciones, Logs de Auditoría, Configuración.
 *
 * Usage:
 *   // Inside the owner layout sidebar nav:
 *   import { SystemDevMenu } from '@/components/owner/SystemDevMenu';
 *   <SystemDevMenu />
 *
 *   // Or with a custom root path prefix if needed:
 *   <SystemDevMenu basePath="/owner/system-dev" />
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ToggleLeft,
  ClipboardList,
  Settings2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** When true, only highlight when the path is an exact match */
  exact?: boolean;
}

interface SystemDevMenuProps {
  /** Override the base path if the section is mounted elsewhere. Defaults to "/owner/system-dev". */
  basePath?: string;
}

const buildNavItems = (base: string): NavItem[] => [
  {
    label: 'Dashboard',
    href: base,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Gestión de Funciones',
    href: `${base}/functions`,
    icon: ToggleLeft,
  },
  {
    label: 'Logs de Auditoría',
    href: `${base}/audit-logs`,
    icon: ClipboardList,
  },
  {
    label: 'Configuración',
    href: `${base}/settings`,
    icon: Settings2,
  },
];

export function SystemDevMenu({ basePath = '/owner/system-dev' }: SystemDevMenuProps) {
  const pathname = usePathname();
  const navItems = buildNavItems(basePath);

  const isActive = (item: NavItem): boolean => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav
      aria-label="Sistema y Desarrollo"
      className="flex flex-col gap-1"
    >
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Sistema y Desarrollo
      </p>

      {navItems.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ].join(' ')}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
