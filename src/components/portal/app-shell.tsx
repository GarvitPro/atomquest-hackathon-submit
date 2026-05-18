"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  Gauge,
  GitPullRequest,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { roleLabels } from "@/lib/format";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
  },
  {
    label: "My goals",
    href: "/employee/goals",
    icon: Target,
    roles: ["EMPLOYEE"],
  },
  {
    label: "Check-ins",
    href: "/employee/check-ins",
    icon: ClipboardCheck,
    roles: ["EMPLOYEE"],
  },
  {
    label: "Approvals",
    href: "/manager/approvals",
    icon: GitPullRequest,
    roles: ["MANAGER"],
  },
  {
    label: "Team",
    href: "/manager/team",
    icon: Users,
    roles: ["MANAGER"],
  },
  {
    label: "Cycles",
    href: "/admin/cycles",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    label: "Audit",
    href: "/admin/audit",
    icon: History,
    roles: ["ADMIN"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileSpreadsheet,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    label: "Analytics",
    href: "/dashboard#analytics",
    icon: BarChart3,
    roles: ["MANAGER", "ADMIN"],
  },
];

function initials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AQ"
  );
}

function NavLinks({ role }: { role: Role }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground",
              active && "bg-secondary text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user.role ?? "EMPLOYEE";

  return (
    <div className="min-h-screen bg-background surface-grid">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/95 px-4 py-5 shadow-sm backdrop-blur lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">AtomQuest</p>
            <p className="text-xs text-muted-foreground">Goal Portal</p>
          </div>
        </div>
        <Separator className="my-5" />
        <NavLinks role={role} />
        <div className="absolute bottom-5 left-4 right-4">
          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials(session?.user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {session?.user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {roleLabels[role]}
                </p>
              </div>
            </div>
            <Button
              className="mt-3 w-full justify-start"
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-card/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {session?.user.department}
                </p>
                <h1 className="text-xl font-semibold tracking-normal">
                  {roleLabels[role]} workspace
                </h1>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm sm:flex">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials(session?.user.name)}</AvatarFallback>
              </Avatar>
              <span className="max-w-48 truncate font-medium">
                {session?.user.name}
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground",
                      active && "border-primary text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
