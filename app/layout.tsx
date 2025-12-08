import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuvic Public API Showcase",
  description: "A showcase of public APIs powered by Cuvic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
