// components/shared/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, HomeIcon, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const navLinks = [
  { name: "Agendar", href: "/agendar", icon: HomeIcon },
  { name: "Ver Agendamentos", href: "/meus-agendamentos", icon: Calendar },
  { name: "Gerenciar Horários", href: "/admin/horarios", icon: Clock },
  { name: "Profissionais", href: "/admin/profissionais", icon: Users },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky px-10 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        {/* Logo */}
        <Link href="/agendar" className="flex items-center space-x-2">
          <span className="font-bold">Salão App</span>
        </Link>

        {/* Navegação para Desktop */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Botão do Menu Mobile */}
        <div className="md:hidden">
          <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background shadow-md">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center py-3 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
              >
                <link.icon className="mr-3 h-5 w-5" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
