import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Orbital Command",
  description: "Unified operations, observability and automation platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
