"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Workpapers", href: "/workpapers/wp-001", icon: FileText },
  { name: "Findings", href: "#", icon: ShieldCheck, disabled: true },
  { name: "Library", href: "#", icon: BookOpen, disabled: true },
  { name: "Settings", href: "#", icon: Settings, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-card lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">AuditFlow</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            AI
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("/").slice(0, 2).join("/")) &&
                item.href !== "#";
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
              aria-disabled={item.disabled}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
              {item.disabled && (
                <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/60 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-zinc-900 text-white text-[11px]">
              SC
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-medium truncate">Sarah Chen</span>
            <span className="text-xs text-muted-foreground truncate">
              Audit Manager
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
