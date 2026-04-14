'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  CalendarDays
} from 'lucide-react';
import { getSession } from '@/lib/session';
import { Badge } from '@/components/ui/badge';

const menuLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/communications', label: 'Comunidad', icon: MessageSquare, badge: 2 },
  { href: '/employees', label: 'Empleados', icon: Users },
  { href: '/leave', label: 'Ausencias', icon: CalendarOff },
  { href: '/payslips', label: 'Nómina', icon: Banknote },
  { href: '/development', label: 'Desarrollo', icon: ClipboardCheck },
  { href: '/recruitment', label: 'Reclutamiento', icon: Briefcase },
  { href: '/organization-chart', label: 'Organigrama', icon: Network },
  { href: '/ai-assistant', label: 'Asistente IA', icon: Sparkles },
];

const myPortalLinks = [
  { href: '/my-portal', label: 'Mi Resumen', icon: LayoutDashboard },
  { href: '/my-portal/my-file', label: 'Mi Legajo', icon: FileText },
  { href: '/my-portal/leaves', label: 'Mis Licencias', icon: CalendarDays },
  { href: '/my-portal/payslips', label: 'Mis Recibos', icon: Banknote },
];

const accountLinks = [
    { href: '/settings', label: 'Configuración', icon: Settings },
    { href: '/help', label: 'Centro de Ayuda', icon: LifeBuoy },
]

export function MainNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const session = getSession();

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const renderLink = (item: { href: string; label: string; icon: React.ElementType; adminOnly?: boolean; badge?: number }) => {
    if (item.adminOnly && session && session.role !== 'admin') return null;
    
    // Si la ruta base coincide, está activo
    const isActive = pathname.startsWith(item.href) && (item.href !== '/my-portal' || pathname === '/my-portal');

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
                    <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center p-0 text-[10px] rounded-full">
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
                <SidebarGroupLabel>MI PORTAL</SidebarGroupLabel>
                {myPortalLinks.map(link => renderLink(link))}
            </SidebarGroup>
            
            {session && session.role !== 'employee' && (
              <>
                <SidebarSeparator className="my-2"/>
                <SidebarGroup>
                    <SidebarGroupLabel>ADMINISTRACIÓN</SidebarGroupLabel>
                    {menuLinks.map(link => renderLink(link))}
                </SidebarGroup>
              </>
            )}

            <SidebarSeparator className="my-2"/>
            <SidebarGroup>
                <SidebarGroupLabel>AJUSTES Y AYUDA</SidebarGroupLabel>
                {accountLinks.map(link => renderLink(link))}
            </SidebarGroup>
        </SidebarMenu>
    </nav>
  );
}