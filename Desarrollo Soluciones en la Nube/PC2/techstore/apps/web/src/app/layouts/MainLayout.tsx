import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Shield,
  Store as StoreIcon,
  ScrollText,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { authApi } from '@/features/auth/api';
import { useTheme } from '@/app/providers/ThemeProvider';
import { usePermission } from '@/shared/hooks/usePermission';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
}

export function MainLayout() {
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { has, can } = usePermission();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/products', label: 'Productos', icon: Package, show: can('list', 'product') },
    { to: '/users', label: 'Usuarios', icon: Users, show: has('ADMIN') || has('AUDITOR') },
    { to: '/roles', label: 'Roles', icon: Shield, show: has('ADMIN') },
    { to: '/stores', label: 'Tiendas', icon: StoreIcon, show: true },
    { to: '/audit', label: 'Auditoría', icon: ScrollText, show: can('list', 'audit-log') },
  ];

  const visibleItems = items.filter((i) => i.show);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
          <Link to="/dashboard" className="ml-2 flex items-center gap-2 font-semibold">
            <Package className="size-5 text-primary" />
            <span>TechStore</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Cambiar tema">
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <div className="hidden md:flex md:flex-col md:items-end md:leading-tight">
              <span className="text-sm font-medium">{user?.fullName}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
            <div className="hidden md:flex md:gap-1">
              {user?.roles.map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px]">
                  {r}
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            'fixed inset-y-14 left-0 z-20 w-64 shrink-0 border-r bg-background transition-transform md:static md:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="flex flex-col gap-1 p-3" aria-label="Navegación principal">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
