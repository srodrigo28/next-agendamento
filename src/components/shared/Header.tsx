// components/shared/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, HomeIcon } from "lucide-react"; // Ícones para a UI

// Define os links que aparecerão no cabeçalho
const navLinks = [
  { name: "Agendar", href: "/agendar", icon: HomeIcon },
  { name: "Ver Agendamentos", href: "/meus-agendamentos", icon: Calendar },
  { name: "Gerenciar Horários", href: "/admin/horarios", icon: Clock },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/agendar" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Salão App</span>
          </Link>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
