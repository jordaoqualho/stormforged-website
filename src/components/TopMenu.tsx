"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Hook to detect if content might be translated
const useTranslationDetection = () => {
  const [isLikelyTranslated, setIsLikelyTranslated] = useState(false);

  useEffect(() => {
    // Check for common translation indicators
    const checkTranslation = () => {
      // Check if Google Translate is active
      const hasGoogleTranslate =
        document.querySelector("html[lang]") && document.querySelector("html").getAttribute("lang") !== "en";

      // Check for translation classes added by browsers
      const hasTranslationClasses =
        document.querySelector(".skiptranslate") !== null || document.querySelector(".goog-te-banner-frame") !== null;

      // Check for unusually long text in navigation
      const navTexts = Array.from(document.querySelectorAll(".tab-rpg span")).map((el) => el.textContent);
      const hasLongTexts = navTexts.some((text) => text && text.length > 15);

      setIsLikelyTranslated(hasGoogleTranslate || hasTranslationClasses || hasLongTexts);
    };

    checkTranslation();

    // Recheck periodically in case translation loads after initial render
    const interval = setInterval(checkTranslation, 1000);
    return () => clearInterval(interval);
  }, []);

  return isLikelyTranslated;
};

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

// Mobile-friendly labels for very small screens and translations
const getMobileLabel = (label: string) => {
  const mobileLabels: Record<string, string> = {
    // English labels
    "Battle Command": "Battle",
    "War Analytics": "Analytics",
    "Guild Archives": "Archives",
    Tools: "Tools",
    // Spanish translations (common browser translation)
    "Comando de batalla": "Batalla",
    "Análisis de guerra": "Análisis",
    "Archivo de gremio": "Archivo",
    Herramientas: "Tools",
    // Other common translations
    "Comando de Batalha": "Batalha", // Portuguese
    "Análise de Guerra": "Análise", // Portuguese
    "Arquivo da Guilda": "Arquivo", // Portuguese
    Ferramentas: "Tools", // Portuguese
  };
  return mobileLabels[label] || label.substring(0, 8); // Fallback to first 8 chars
};

const TOOLS: ToolItem[] = [
  { href: "/charm-builder", label: "Charm Builder", icon: "🧿" },
  { href: "/sigmund", label: "Calculator", icon: "🧠" },
];

export default function TopMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLikelyTranslated = useTranslationDetection();
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");

  const isToolsActive = TOOLS.some(
    (tool) => pathname === tool.href || (tool.href !== "/" && pathname?.startsWith(tool.href))
  );

  // Close dropdown when clicking outside and handle viewport overflow
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    }

    function handleViewportCheck() {
      if (showToolsDropdown && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If there's not enough space below but more space above, position above
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setDropdownPosition("top");
        } else {
          setDropdownPosition("bottom");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleViewportCheck);
    handleViewportCheck(); // Check on mount

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleViewportCheck);
    };
  }, [showToolsDropdown]);

  return (
    <nav className="w-full overflow-visible relative z-30">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
        <div className="flex w-full space-x-0.5 sm:space-x-1 min-w-full overflow-visible">
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
                className={`tab-rpg flex-1 min-w-0 sm:min-w-48 md:min-w-64 ${isActive ? "active" : ""} ${
                  isLikelyTranslated ? "translated" : ""
                }`}
              >
                <div className="flex flex-col items-center space-y-0.5 px-0.5 sm:px-1 w-full">
                  <span className="text-xs sm:text-xl md:text-2xl flex-shrink-0">{item.icon}</span>
                  <span
                    className={`font-pixel leading-tight text-center w-full overflow-hidden text-ellipsis whitespace-nowrap ${
                      isLikelyTranslated ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-sm"
                    }`}
                  >
                    <span className="sm:hidden">{getMobileLabel(item.label)}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  {item.desc && (
                    <span
                      className={`font-pixel-operator opacity-75 hidden sm:block leading-tight text-center w-full overflow-hidden text-ellipsis whitespace-nowrap ${
                        isLikelyTranslated ? "text-[7px] sm:text-[8px]" : "text-[8px] sm:text-[10px]"
                      }`}
                    >
                      {item.desc}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Tools Dropdown */}
          <div ref={dropdownRef} className="relative flex-1 min-w-0 sm:min-w-48 md:min-w-64">
            <button
              onClick={() => {
                setShowToolsDropdown(!showToolsDropdown);
              }}
              className={`tab-rpg w-full ${isToolsActive ? "active" : ""} ${isLikelyTranslated ? "translated" : ""}`}
              aria-expanded={showToolsDropdown}
              aria-haspopup="true"
            >
              <div className="flex flex-col items-center space-y-0.5 px-0.5 sm:px-1 w-full">
                <span className="text-xs sm:text-xl md:text-2xl flex-shrink-0">🛠️</span>
                <span
                  className={`font-pixel leading-tight text-center w-full overflow-hidden text-ellipsis whitespace-nowrap ${
                    isLikelyTranslated ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-sm"
                  }`}
                >
                  <span className="sm:hidden">{getMobileLabel("Tools")}</span>
                  <span className="hidden sm:inline">Tools</span>
                </span>
                <span
                  className={`font-pixel-operator opacity-75 hidden sm:block leading-tight text-center w-full overflow-hidden text-ellipsis whitespace-nowrap ${
                    isLikelyTranslated ? "text-[7px] sm:text-[8px]" : "text-[8px] sm:text-[10px]"
                  }`}
                >
                  Calculators
                </span>
              </div>
            </button>

            {showToolsDropdown && (
              <div
                className={`absolute left-0 right-0 z-[50] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-2 border-mystic-blue shadow-glow-blue w-full sm:w-auto sm:min-w-[200px] max-h-[200px] overflow-y-auto ${
                  dropdownPosition === "top"
                    ? "bottom-full mb-1 border-b-2 border-t-0 rounded-t-pixel"
                    : "top-full mt-1 border-t-0 rounded-b-pixel"
                }`}
                style={{ display: "block" }}
              >
                {TOOLS.map((tool) => {
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setShowToolsDropdown(false)}
                      className={`block w-full px-2 sm:px-4 py-1.5 sm:py-3 hover:bg-mystic-blue hover:bg-opacity-20 transition-colors duration-150 ${
                        isActive ? "bg-mystic-blue bg-opacity-30" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-3">
                        <span className="text-sm sm:text-lg flex-shrink-0">{tool.icon}</span>
                        <span className="font-pixel text-[10px] sm:text-sm text-text-primary truncate">
                          {tool.label}
                        </span>
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
