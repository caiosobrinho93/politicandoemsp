"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * Navegação principal.
 *
 * Componente cliente apenas porque precisa da rota atual para marcar
 * `aria-current="page"`. No celular a lista rola horizontalmente, sem menu
 * sanfona e sem animação.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-stretch gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {mainNavigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded px-3 text-sm font-medium no-underline",
                isActive
                  ? "bg-brand-50 text-brand-800"
                  : "text-ink-700 hover:bg-ink-100",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
