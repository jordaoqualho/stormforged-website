"use client";

import { Player, fuzzySearch, generatePlayerAvatar, getRecentPlayers } from "@/lib/players";
import { useGuildWarStore } from "@/store/guildWarStore";
import { forwardRef, useEffect, useRef, useState } from "react";

interface PlayerAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  onBlur?: () => void;
}

const PlayerAutocomplete = forwardRef<HTMLInputElement, PlayerAutocompleteProps>(
  (
    {
      value,
      onChange,
      placeholder = "Enter warrior name...",
      className = "",
      disabled = false,
      error = false,
      id,
      onBlur,
    },
    ref
  ) => {
    const [query, setQuery] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [recentPlayers, setRecentPlayers] = useState<Player[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { attacks } = useGuildWarStore();

    // Generate players list from attack history
    useEffect(() => {
      const uniquePlayers = new Map<string, Player>();

      attacks.forEach((attack) => {
        if (!uniquePlayers.has(attack.playerName)) {
          uniquePlayers.set(attack.playerName, {
            id: attack.playerName.toLowerCase().replace(/\s+/g, "-"),
            name: attack.playerName,
            avatar: generatePlayerAvatar(attack.playerName),
            lastUsed: new Date(attack.date),
            totalBattles: 0,
            winRate: 0,
          });
        }

        const player = uniquePlayers.get(attack.playerName)!;
        player.totalBattles = (player.totalBattles || 0) + attack.attacks;
        player.winRate =
          ((player.winRate || 0) * (player.totalBattles - attack.attacks) + attack.wins) / player.totalBattles;
      });

      const playersList = Array.from(uniquePlayers.values());
      setPlayers(playersList);
      setRecentPlayers(getRecentPlayers(playersList));
    }, [attacks]);

    const filteredPlayers = fuzzySearch(players, query);
    const showRecent = !query && recentPlayers.length > 0;

    // Sync query state with value prop (for when parent clears the value)
    useEffect(() => {
      if (!value) {
        setQuery("");
      }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    // Prevent body scroll issues when dropdown is open
    useEffect(() => {
      if (isOpen) {
        // Ensure body overflow is not affected
        const originalOverflow = document.body.style.overflow;
        const originalOverflowX = document.body.style.overflowX;
        const originalOverflowY = document.body.style.overflowY;

        // Ensure scrolling remains enabled
        document.body.style.overflow = "auto";
        document.body.style.overflowX = "auto";
        document.body.style.overflowY = "auto";

        // Add scroll event listener to ensure scrolling works
        const handleScroll = (e: Event) => {
          // Allow scrolling to continue normally
          e.stopPropagation();
        };

        document.addEventListener("wheel", handleScroll, { passive: true });
        document.addEventListener("scroll", handleScroll, { passive: true });

        // Restore original overflow when dropdown closes
        return () => {
          document.body.style.overflow = originalOverflow;
          document.body.style.overflowX = originalOverflowX;
          document.body.style.overflowY = originalOverflowY;
          document.removeEventListener("wheel", handleScroll);
          document.removeEventListener("scroll", handleScroll);
        };
      }
    }, [isOpen]);

    const handleSelect = (player: Player) => {
      if (!player) return;

      const selectedName = player.name || "";
      if (selectedName) {
        onChange(selectedName.trim());
        setQuery("");
        setIsOpen(false);
      }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setQuery(newValue);
      onChange(newValue.trim());
      setIsOpen(true); // Open dropdown when typing
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsOpen(false); // Close dropdown when Enter is pressed
        // Find the form and trigger submission
        const form = event.currentTarget.closest("form");
        if (form) {
          // Trigger form submission
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="text"
            value={value}
            disabled={disabled}
            className={`
              w-full px-4 py-3
              bg-[#2A2A2A] border-2 ${error ? "border-danger" : "border-mystic-blue"}
              text-text-primary font-pixel-operator text-base
              rounded-pixel
              shadow-inner-glow
              transition-all duration-200
              focus:border-gold focus:shadow-glow-gold focus:outline-none
              placeholder:text-text-muted
              hover:${error ? "border-danger-light" : "border-mystic-blue-light"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              // Delay closing to allow option clicks
              setTimeout(() => setIsOpen(false), 150);
              onBlur?.();
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
          />

          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="text-text-muted hover:text-gold transition-colors">🔍</div>
          </button>
        </div>

        {/* Custom Dropdown */}
        {isOpen && (filteredPlayers.length > 0 || showRecent) && (
          <div
            className={`
              absolute z-10 mt-2 w-full
              bg-[#2A2A2A] border-2 border-mystic-blue
              rounded-pixel shadow-[8px_8px_0px_rgba(0,0,0,0.8)]
              max-h-60 overflow-auto
            `}
          >
            {showRecent && (
              <div className="px-3 py-2 border-b border-mystic-blue">
                <div className="text-xs font-pixel text-gold">Recent Members</div>
              </div>
            )}

            {showRecent &&
              recentPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelect(player)}
                  className={`
                    w-full text-left relative cursor-pointer select-none py-3 px-4
                    transition-all duration-150
                    text-text-secondary hover:bg-mystic-blue hover:bg-opacity-20
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{player.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-pixel text-sm text-text-primary">{player.name}</div>
                      <div className="text-xs text-text-muted font-pixel-operator">
                        {player.totalBattles} battles • {Math.round((player.winRate || 0) * 100)}% win rate
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {query && filteredPlayers.length > 0 && (
              <div className="px-3 py-2 border-b border-mystic-blue">
                <div className="text-xs font-pixel text-gold">Matching Members</div>
              </div>
            )}

            {query &&
              filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelect(player)}
                  className={`
                    w-full text-left relative cursor-pointer select-none py-3 px-4
                    transition-all duration-150
                    text-text-secondary hover:bg-mystic-blue hover:bg-opacity-20
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{player.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-pixel text-sm text-text-primary">{player.name}</div>
                      <div className="text-xs text-text-muted font-pixel-operator">
                        {player.totalBattles} battles • {Math.round((player.winRate || 0) * 100)}% win rate
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {query && filteredPlayers.length === 0 && (
              <div className="px-4 py-3 text-text-muted font-pixel-operator text-sm">
                No members found. Press Enter to add "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PlayerAutocomplete.displayName = "PlayerAutocomplete";

export default PlayerAutocomplete;
