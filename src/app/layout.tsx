import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nome do Salão - Agendamentos",
  description: "Agende seu horário em nosso salão de forma rápida e fácil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased px-10`}
      >
         {/* 2. Adicionamos o Header aqui, acima do conteúdo da página */}
        <Header />
        {/* 3. O 'children' representa o conteúdo de cada página individual */}
        <main>{children}</main>
      </body>
    </html>
  );
}
