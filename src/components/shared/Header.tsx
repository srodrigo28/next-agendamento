// components/shared/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, HomeIcon, Users, ClipboardList, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const navLinks = [
  { name: "Agendar", href: "/agendar", icon: HomeIcon },
  { name: "Ver Agendamentos", href: "/meus-agendamentos", icon: Calendar },
  { name: "Gerenciar Horários", href: "/admin/horarios", icon: Clock },
  { name: "Profissionais", href: "/admin/profissionais", icon: Users },
  { name: "Serviços", href: "/admin/servicos", icon: ClipboardList }, 
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-none supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/agendar" className="flex items-center space-x-2">
          <span className="font-bold">Salão App</span>
        </Link>

        {/* ================================================================== */}
        {/* NAVEGAÇÃO DESKTOP MELHORADA                                      */}
        {/* ================================================================== */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                  ${isActive 
                    ? 'bg-sky-400 border-none text-white' 
                    : 'text-muted-foreground hover:bg-muted/50 border-none'
                  }
                `}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Botão do Menu Mobile */}
        <div className="md:hidden">
          <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MENU MOBILE MELHORADO (SEM LAYOUT SHIFT)                         */}
      {/* ================================================================== */}
      {isMenuOpen && (
        <div 
          className="
            md:hidden fixed top-14 left-0 right-0 z-40 w-full bg-background shadow-lg
            animate-in slide-in-from-top-2
          "
        >
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center rounded-md py-3 px-4 text-base font-medium hover:bg-accent border-none"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
