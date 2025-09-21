"use client";

import { PLAYER_ROLES, Player, fuzzySearch, generatePlayerAvatar, getRecentPlayers } from "@/lib/players";
import { useGuildWarStore } from "@/store/guildWarStore";
import { Combobox } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";

interface PlayerAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function PlayerAutocomplete({
  value,
  onChange,
  placeholder = "Enter warrior name...",
  className = "",
  disabled = false,
}: PlayerAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<Player[]>([]);
  const { attacks } = useGuildWarStore();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelect = (player: Player | string) => {
    const selectedName = typeof player === "string" ? player : player.name;
    onChange(selectedName);
    setQuery("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setQuery(newValue);
    onChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <Combobox value={value} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            ref={inputRef}
            disabled={disabled}
            className={`
              w-full px-4 py-3
              bg-[#2A2A2A] border-2 border-mystic-blue
              text-text-primary font-pixel-operator text-base
              rounded-pixel
              shadow-inner-glow
              transition-all duration-200
              focus:border-gold focus:shadow-glow-gold focus:outline-none
              placeholder:text-text-muted
              hover:border-mystic-blue-light
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            displayValue={() => value}
            onChange={handleInputChange}
            placeholder={placeholder}
            autoComplete="off"
          />

          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="text-text-muted hover:text-gold transition-colors">🔍</div>
          </Combobox.Button>
        </div>

        <Combobox.Options
          className={`
          absolute z-20 mt-2 w-full
          bg-[#2A2A2A] border-2 border-mystic-blue
          rounded-pixel shadow-[8px_8px_0px_rgba(0,0,0,0.8)]
          max-h-60 overflow-auto
          ${filteredPlayers.length > 0 || showRecent ? "block" : "hidden"}
        `}
        >
          {showRecent && (
            <div className="px-3 py-2 border-b border-mystic-blue">
              <div className="text-xs font-pixel text-gold">Recent Warriors</div>
            </div>
          )}

          {showRecent &&
            recentPlayers.map((player) => (
              <Combobox.Option
                key={player.id}
                value={player}
                className={({ active }) => `
                relative cursor-pointer select-none py-3 px-4
                transition-all duration-150
                ${active ? "bg-mystic-blue text-text-primary" : "text-text-secondary"}
                hover:bg-mystic-blue-light
              `}
              >
                {({ selected }) => (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{player.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-pixel text-sm ${selected ? "text-gold" : "text-text-primary"}`}>
                        {player.name}
                      </div>
                      <div className="text-xs text-text-muted font-pixel-operator">
                        {player.totalBattles} battles • {Math.round((player.winRate || 0) * 100)}% win rate
                      </div>
                    </div>
                    {selected && <span className="text-gold text-sm">✓</span>}
                  </div>
                )}
              </Combobox.Option>
            ))}

          {query && filteredPlayers.length > 0 && (
            <div className="px-3 py-2 border-b border-mystic-blue">
              <div className="text-xs font-pixel text-gold">Matching Warriors</div>
            </div>
          )}

          {query &&
            filteredPlayers.map((player) => (
              <Combobox.Option
                key={player.id}
                value={player}
                className={({ active }) => `
                relative cursor-pointer select-none py-3 px-4
                transition-all duration-150
                ${active ? "bg-mystic-blue text-text-primary" : "text-text-secondary"}
                hover:bg-mystic-blue-light
              `}
              >
                {({ selected }) => (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{player.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-pixel text-sm ${selected ? "text-gold" : "text-text-primary"}`}>
                        {player.name}
                      </div>
                      <div className="text-xs text-text-muted font-pixel-operator">
                        {player.totalBattles} battles • {Math.round((player.winRate || 0) * 100)}% win rate
                      </div>
                    </div>
                    {selected && <span className="text-gold text-sm">✓</span>}
                  </div>
                )}
              </Combobox.Option>
            ))}

          {query && filteredPlayers.length === 0 && (
            <div className="px-4 py-3 text-text-muted font-pixel-operator text-sm">
              No warriors found. Press Enter to add "{query}"
            </div>
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
