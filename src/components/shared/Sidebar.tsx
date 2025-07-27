// components/shared/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, Home } from "lucide-react"; // Ícones para deixar mais bonito

const navLinks = [
  { name: "Agendar", href: "/agendar", icon: Home },
  { name: "Ver Agendamentos", href: "/meus-agendamentos", icon: Calendar },
  { name: "Gerenciar Horários", href: "/admin/horarios", icon: Clock },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-8">Salão Admin</h2>
      <nav className="flex flex-col space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <link.icon className="mr-3 h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
