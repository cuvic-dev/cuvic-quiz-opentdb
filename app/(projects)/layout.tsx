import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Cuvic Public API Showcase",
  description: "A showcase of public APIs powered by Cuvic.",
};

export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
