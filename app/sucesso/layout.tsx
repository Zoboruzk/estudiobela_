import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agendamento confirmado — Studio Bela",
  robots: { index: false, follow: false },
};

export default function SucessoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
