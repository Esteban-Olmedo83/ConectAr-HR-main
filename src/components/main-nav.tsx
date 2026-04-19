'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  CalendarOff,
  ClipboardCheck,
  Sparkles,
  LifeBuoy,
  Settings,
  Briefcase,
  UserCircle,
  Network,
  MessageSquare,
  Banknote,
  FileText,
  CalendarDays,
  Cog,
  Building2
} from 'lucide-react';
import { getSession } from '@/lib/session';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/hooks/use-locale';

export function MainNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const session = getSession();
  const { t } = useLocale();

  const menuLinks = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/communications', label: t.nav.communications, icon: MessageSquare, badge: 2 },
    { href: '/employees', label: t.nav.employees, icon: Users },
    { href: '/leave', label: t.nav.leave, icon: CalendarOff },
    { href: '/payslips', label: t.nav.payslips, icon: Banknote },
    { href: '/development', label: t.nav.development, icon: ClipboardCheck },
    { href: '/recruitment', label: t.nav.recruitment, icon: Briefcase },
    { href: '/organization-chart', label: t.nav.orgChart, icon: Network },
    { href: '/ai-assistant', label: t.nav.aiAssistant, icon: Sparkles },
  ];

  const myPortalLinks = [
    { href: '/my-portal', label: t.nav.mySummary, icon: LayoutDashboard },
    { href: '/my-portal/my-file', label: t.nav.myFile, icon: FileText },
    { href: '/my-portal/leaves', label: t.nav.myLeaves, icon: CalendarDays },
    { href: '/my-portal/payslips', label: t.nav.myPayslips, icon: Banknote },
  ];

  const accountLinks = [
    { href: '/settings', label: t.nav.settings, icon: Settings },
    { href: '/help', label: t.nav.help, icon: LifeBuoy },
  ];

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const renderLink = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    badge?: number;
  }) => {
    if (item.adminOnly && session && session.role !== 'admin') return null;

    // Si la ruta base coincide, está activo
    const isActive =
      pathname.startsWith(item.href) &&
      (item.href !== '/my-portal' || pathname === '/my-portal');

    return (
      <SidebarMenuItem key={item.href + item.label}>
        <Link href={item.href} onClick={handleLinkClick}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={{ children: item.label }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <nav className="flex flex-col h-full">
      <SidebarMenu className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>{t.groups.myPortal}</SidebarGroupLabel>
          {myPortalLinks.map(link => renderLink(link))}
        </SidebarGroup>

        {session && session.role === 'owner' && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>{t.groups.owner}</SidebarGroupLabel>
              <SidebarMenuItem>
                <Link href="/owner/system-dev" onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/owner/system-dev')}
                    tooltip={{ children: t.nav.systemDev }}
                  >
                    <Cog className="h-4 w-4" />
                    <span>{t.nav.systemDev}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarGroup>
          </>
        )}

        {session && session.role !== 'employee' && session.role !== 'owner' && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>{t.groups.admin}</SidebarGroupLabel>
              {menuLinks.map(link => renderLink(link))}
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel>{t.groups.settingsHelp}</SidebarGroupLabel>
          {accountLinks.map(link => renderLink(link))}
        </SidebarGroup>
      </SidebarMenu>
    </nav>
  );
}
