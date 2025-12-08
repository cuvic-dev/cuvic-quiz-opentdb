"use client";

import { Menu, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={cn(
        "h-screen bg-gray-900 text-white flex flex-col p-4 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between">
        {!collapsed && <h1 className="text-lg font-bold">Dashboard</h1>}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {!collapsed && (
        <div className="mt-4 mb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-gray-800 border-none text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-2 mt-4"></nav>
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  href,
  collapsed
}: {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  collapsed: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        href={href || "#"}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-all"
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </Link>
    </TooltipTrigger>
    {collapsed && <TooltipContent>{label}</TooltipContent>}
  </Tooltip>
);

export default Sidebar;
