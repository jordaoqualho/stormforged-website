"use client";

import AchievementSystem from "@/components/AchievementSystem";
import AddAttackForm from "@/components/AddAttackForm";
import Charts from "@/components/Charts";
import CurrentWeekStats from "@/components/CurrentWeekStats";
import DataManagement from "@/components/DataManagement";
import NotificationSystem, { useNotifications } from "@/components/NotificationSystem";
import SoundToggle from "@/components/SoundToggle";
import MusicPlayer from "@/components/MusicPlayer";
import { useRPGSounds } from "@/lib/sounds";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useState } from "react";

export default function Home() {
  const { loadData, isLoading } = useGuildWarStore();
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "data">("overview");
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  const { playClick } = useRPGSounds();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-battlefield flex items-center justify-center">
        <div className="text-center">
          <div className="icon-rpg text-6xl mb-6 animate-pulse-glow">⚔️</div>
          <div className="loading-rpg w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gold font-pixel-operator">Loading Stormforged battle data...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-battlefield">
      {/* Notification System */}
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] border-b-2 border-gold shadow-[8px_8px_0px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="icon-rpg text-4xl pixel-glow">🏰</div>
              <div>
                <h1 className="text-2xl font-pixel text-gold text-glow">Stormforged</h1>
                <p className="text-sm text-text-secondary font-pixel-operator">Idle Horizon Guild War Command Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gold font-pixel">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-xs text-text-muted font-pixel-operator">
                  Battle Day #{Math.ceil((Date.now() - new Date("2024-01-01").getTime()) / (1000 * 60 * 60 * 24))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <SoundToggle />
                <div className="w-12 h-12 bg-gradient-to-b from-[#FFD700] to-[#B8860B] border-2 border-[#B8860B] rounded-full flex items-center justify-center shadow-glow-gold">
                  <span className="text-xl">⚔️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gradient-to-r from-dark via-darker to-dark border-b-2 border-mystic-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: "overview", label: "Battle Command", icon: "⚔️", desc: "Record & Monitor" },
              { id: "charts", label: "War Analytics", icon: "📈", desc: "Visual Reports" },
              { id: "data", label: "Guild Archives", icon: "📚", desc: "Data Management" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as "overview" | "charts" | "data");
                  playClick();
                }}
                className={`tab-rpg flex-1 ${activeTab === tab.id ? "active" : ""}`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="font-pixel text-sm">{tab.label}</span>
                  <span className="font-pixel-operator text-xs opacity-75">{tab.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-7xl mx-auto">
              <AddAttackForm onSuccess={showSuccess} onError={showError} />
              <CurrentWeekStats />
            </div>

            {/* Achievement System */}
            <AchievementSystem />

            {/* Quick Stats Banner */}
            <div className="card-rpg bg-gradient-to-r from-mystic-blue to-mystic-blue-light">
              <div className="flex items-center justify-center space-x-8 py-4">
                <div className="text-center">
                  <div className="text-3xl font-pixel text-gold">{useGuildWarStore.getState().attacks.length}</div>
                  <div className="text-xs text-text-secondary font-pixel-operator">Total Battles</div>
                </div>
                <div className="w-px h-12 bg-gold opacity-50"></div>
                <div className="text-center">
                  <div className="text-3xl font-pixel text-success">
                    {new Set(useGuildWarStore.getState().attacks.map((a) => a.playerName)).size}
                  </div>
                  <div className="text-xs text-text-secondary font-pixel-operator">Active Warriors</div>
                </div>
                <div className="w-px h-12 bg-gold opacity-50"></div>
                <div className="text-center">
                  <div className="text-3xl font-pixel text-warning">
                    {useGuildWarStore.getState().attacks.reduce((sum, a) => sum + a.attacks, 0)}
                  </div>
                  <div className="text-xs text-text-secondary font-pixel-operator">Total Strikes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="space-y-8">
            <Charts />
          </div>
        )}

        {activeTab === "data" && (
          <div className="max-w-4xl">
            <DataManagement onSuccess={showSuccess} onError={showError} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] border-t-2 border-mystic-blue mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="icon-rpg text-3xl mb-2">🏰</div>
              <h3 className="font-pixel text-gold mb-2">Stormforged</h3>
              <p className="text-xs text-text-muted font-pixel-operator">Idle Horizon Guild War Command Center</p>
            </div>
            <div className="text-center">
              <div className="icon-rpg text-3xl mb-2">⚔️</div>
              <h3 className="font-pixel text-gold mb-2">Battle Tracker</h3>
              <p className="text-xs text-text-muted font-pixel-operator">
                Track your guild's performance and dominate the battlefield!
              </p>
            </div>
            <div className="text-center">
              <div className="icon-rpg text-3xl mb-2">📊</div>
              <h3 className="font-pixel text-gold mb-2">Analytics</h3>
              <p className="text-xs text-text-muted font-pixel-operator">
                Real-time statistics and performance insights
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-mystic-blue">
            <div className="text-center">
              <p className="text-xs text-text-muted font-pixel-operator">
                Built with ⚔️ for the Heroes of Horizon community • Powered by Next.js &amp; TailwindCSS
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}
