import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "SincroHub",
  description: "Sistema integrado de operações e monitoramento para telemetria, incidentes e automação."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
