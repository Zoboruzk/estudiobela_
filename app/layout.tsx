import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Metadados base. Cada negócio (multi-tenant) pode sobrescrever isso
// dinamicamente em cada page.tsx usando generateMetadata().
export const metadata: Metadata = {
  title: "Studio Bela — Espaço de Beleza",
  description:
    "Agende serviços de beleza no Studio Bela — corte, escova, coloração e manicure. Vila Madalena, São Paulo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
