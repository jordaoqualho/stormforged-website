"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MenuItem = {
  href: string;
  label: string;
  icon: string;
  desc?: string;
};

type ToolItem = {
  href: string;
  label: string;
  icon: string;
};

const MAIN_MENU: MenuItem[] = [
  { href: "/", label: "Battle Command", icon: "⚔️", desc: "Record & Monitor" },
  { href: "/?tab=charts", label: "War Analytics", icon: "📈", desc: "Visual Reports" },
  { href: "/?tab=data", label: "Guild Archives", icon: "📚", desc: "Data Management" },
];

const TOOLS: ToolItem[] = [
  { href: "/charm-builder", label: "Charm Builder", icon: "🧿" },
  { href: "/sigmund", label: "Calculator", icon: "🧠" },
];

export default function TopMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isToolsActive = TOOLS.some(
    (tool) => pathname === tool.href || (tool.href !== "/" && pathname?.startsWith(tool.href))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full overflow-visible relative z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex w-full space-x-1 min-w-full overflow-visible">
          {MAIN_MENU.map((item) => {
            let isActive = false;
            if (item.href === "/") {
              // Battle Command is active when no tab parameter or tab=overview
              isActive = pathname === "/" && (!searchParams.get("tab") || searchParams.get("tab") === "overview");
            } else if (item.href.includes("?tab=")) {
              // Other tabs are active when their specific tab parameter matches
              const tabParam = item.href.split("?tab=")[1];
              isActive = pathname === "/" && searchParams.get("tab") === tabParam;
            } else {
              // For non-home routes
              isActive = pathname === item.href;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tab-rpg flex-1 min-w-48 sm:min-w-64 ${isActive ? "active" : ""}`}
              >
                <div className="flex flex-col items-center space-y-0.5 px-0.5">
                  <span className="text-sm sm:text-xl md:text-2xl">{item.icon}</span>
                  <span className="font-pixel text-[10px] sm:text-sm leading-tight text-center">{item.label}</span>
                  {item.desc && (
                    <span className="font-pixel-operator text-[8px] opacity-75 hidden sm:block leading-tight text-center">
                      {item.desc}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Tools Dropdown */}
          <div ref={dropdownRef} className="relative flex-1 min-w-48 sm:min-w-64">
            <button
              onClick={() => {
                setShowToolsDropdown(!showToolsDropdown);
              }}
              className={`tab-rpg w-full ${isToolsActive ? "active" : ""}`}
            >
              <div className="flex flex-col items-center space-y-0.5 px-0.5">
                <span className="text-sm sm:text-xl md:text-2xl">🛠️</span>
                <span className="font-pixel text-[10px] sm:text-sm leading-tight text-center">Tools</span>
                <span className="font-pixel-operator text-[8px] opacity-75 hidden sm:block leading-tight text-center">
                  Calculators
                </span>
              </div>
            </button>

            {showToolsDropdown && (
              <div
                className="absolute top-full left-0 right-0 z-[100] mt-1 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-2 border-mystic-blue border-t-0 rounded-b-pixel shadow-glow-blue min-w-[200px]"
                style={{ display: "block" }}
              >
                {TOOLS.map((tool) => {
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setShowToolsDropdown(false)}
                      className={`block w-full px-4 py-3 hover:bg-mystic-blue hover:bg-opacity-20 ${
                        isActive ? "bg-mystic-blue bg-opacity-30" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{tool.icon}</span>
                        <span className="font-pixel text-sm text-text-primary">{tool.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
