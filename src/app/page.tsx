"use client";

import AchievementSystem from "@/components/AchievementSystem";
import AddAttackForm from "@/components/AddAttackForm";
import AnimatedContainer from "@/components/AnimatedContainer";
import Charts from "@/components/Charts";
import CurrentWeekStats from "@/components/CurrentWeekStats";
import DailyBattleLog from "@/components/DailyBattleLog";
import DataManagement from "@/components/DataManagement";
import InitialLoadingScreen from "@/components/InitialLoadingScreen";
import MemberRankings from "@/components/MemberRankings";
import NotificationSystem, { useNotifications } from "@/components/NotificationSystem";
import SoundToggle from "@/components/SoundToggle";
import TopMenu from "@/components/TopMenu";
import { getCurrentWeekNumber } from "@/lib/calculations";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import packageJson from "../../package.json";

export default function Home() {
  const { loadData, isLoading, attacks } = useGuildWarStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "data">("overview");
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false); // Will be set based on first visit
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  // Memoized calculations to prevent unnecessary re-renders
  const totalBattles = useMemo(() => attacks.length, [attacks.length]);
  const activeMembers = useMemo(() => new Set(attacks.map((a) => a.playerName)).size, [attacks]);
  const totalAttacks = useMemo(() => attacks.reduce((sum, a) => sum + a.attacks, 0), [attacks]);

  const weekDisplayText = useMemo(() => {
    if (currentWeekNumber === null) return "Calculating...";
    if (currentWeekNumber === 1) return "First Week of Battle";
    if (currentWeekNumber <= 4) return `Week ${currentWeekNumber} Campaign`;
    if (currentWeekNumber <= 12) return `Week ${currentWeekNumber} Siege`;
    if (currentWeekNumber <= 26) return `Week ${currentWeekNumber} War`;
    if (currentWeekNumber <= 39) return `Week ${currentWeekNumber} Crusade`;
    if (currentWeekNumber <= 52) return `Week ${currentWeekNumber} Legend`;
    return `Week ${currentWeekNumber} Epic`;
  }, [currentWeekNumber]);

  // Handle URL parameters for tabs
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "charts" || tab === "data") {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  // Memoize the loading completion callback
  const handleLoadingComplete = useCallback(() => {
    // Mark that user has seen the loading screen
    localStorage.setItem("stormforged-has-seen-loading", "true");
    setIsInitialLoading(false);
  }, []);

  // Handle day click in Daily Battle Log
  const handleDayClick = useCallback(
    (date: string) => {
      if (selectedDate === date) {
        // If clicking the same day, toggle back to week view
        setSelectedDate(null);
      } else {
        // Select the clicked day
        setSelectedDate(date);
      }
    },
    [selectedDate]
  );

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenLoading = localStorage.getItem("stormforged-has-seen-loading");
    if (!hasSeenLoading) {
      setIsInitialLoading(true);
    }

    const initializeApp = async () => {
      // Calculate week number on client side to prevent hydration mismatch
      const weekNumber = getCurrentWeekNumber();
      setCurrentWeekNumber(weekNumber);

      await loadData();

      // If not showing loading screen, we can proceed immediately
      if (hasSeenLoading) {
        setIsInitialLoading(false);
      }
      // If showing loading screen, let InitialLoadingScreen handle the timing
    };

    initializeApp();
  }, [loadData]);

  // Show initial loading screen
  if (isInitialLoading) {
    return <InitialLoadingScreen onComplete={handleLoadingComplete} minDuration={4500} />;
  }

  // Show data loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-battlefield flex items-center justify-center">
        <AnimatedContainer animationType="initial-load" delay={0}>
          <div className="text-center">
            <div className="icon-rpg text-6xl mb-6 animate-pulse-glow">⚔️</div>
            <div className="loading-rpg w-16 h-16 mx-auto mb-4"></div>
            <p className="text-gold font-pixel-operator text-lg animate-pulse">Loading Stormforged battle data...</p>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-3 h-3 bg-gold rounded-full animate-bounce-gentle"></div>
              <div
                className="w-3 h-3 bg-gold rounded-full animate-bounce-gentle"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-gold rounded-full animate-bounce-gentle"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <div className="mt-8 max-w-md mx-auto">
              <div className="progress-rpg h-3">
                <div className="progress-rpg-fill animate-progress-load"></div>
              </div>
              <p className="text-text-muted font-pixel-operator text-sm mt-2">Preparing your command center...</p>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-battlefield">
        {/* Notification System */}
        <NotificationSystem notifications={notifications} onRemove={removeNotification} />

        {/* Header */}
        <AnimatedContainer animationType="slide-up" delay={0}>
          <header className="bg-gradient-to-r from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] border-b-2 border-gold">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-20">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="icon-rpg text-2xl sm:text-4xl pixel-glow">🏰</div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-pixel text-gold text-glow">Stormforged</h1>
                    <p className="text-xs sm:text-sm text-text-secondary font-pixel-operator hidden sm:block">
                      Idle Horizon Guild War Command Center
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gold font-pixel">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-text-muted font-pixel-operator">{weekDisplayText}</div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <SoundToggle />
                  </div>
                </div>
              </div>
              {/* Mobile Date Display */}
              <div className="sm:hidden pb-3">
                <div className="text-sm text-gold font-pixel text-center">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-xs text-text-muted font-pixel-operator text-center">{weekDisplayText}</div>
              </div>
            </div>
          </header>
        </AnimatedContainer>

        {/* Navigation Tabs */}
        <TopMenu />

        {/* Main Content */}
        <main className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8">
          {activeTab === "overview" && (
            <AnimatedContainer animationType="slide-up" delay={200}>
              <div className="space-y-4 sm:space-y-6">
                {/* Battle Log Entry - Compact */}
                <AnimatedContainer animationType="fade-in" delay={300}>
                  <AddAttackForm onSuccess={showSuccess} onError={showError} />
                </AnimatedContainer>

                {/* Current Week Stats - Compact */}
                <AnimatedContainer animationType="fade-in" delay={400}>
                  <CurrentWeekStats />
                </AnimatedContainer>

                {/* Daily Battle Log - Full Width */}
                <AnimatedContainer animationType="fade-in" delay={500}>
                  <DailyBattleLog onDayClick={handleDayClick} selectedDate={selectedDate} />
                </AnimatedContainer>

                {/* Member Rankings - Full Width */}
                <AnimatedContainer animationType="fade-in" delay={600}>
                  <MemberRankings selectedDate={selectedDate} />
                </AnimatedContainer>

                {/* Achievement System */}
                <AnimatedContainer animationType="fade-in" delay={700}>
                  <AchievementSystem />
                </AnimatedContainer>

                {/* Quick Stats Banner */}
                <AnimatedContainer animationType="fade-in" delay={800}>
                  <div className="card-rpg bg-gradient-to-r from-mystic-blue to-mystic-blue-light">
                    <div className="flex items-center justify-center space-x-4 sm:space-x-8 py-3 sm:py-4">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-pixel text-gold">{totalBattles}</div>
                        <div className="text-xs text-text-secondary font-pixel-operator">Total Battles</div>
                      </div>
                      <div className="w-px h-8 sm:h-12 bg-gold opacity-50"></div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-pixel text-success">{activeMembers}</div>
                        <div className="text-xs text-text-secondary font-pixel-operator">Active Members</div>
                      </div>
                      <div className="w-px h-8 sm:h-12 bg-gold opacity-50"></div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-pixel text-warning">{totalAttacks}</div>
                        <div className="text-xs text-text-secondary font-pixel-operator">Total Attacks</div>
                      </div>
                    </div>
                  </div>
                </AnimatedContainer>
              </div>
            </AnimatedContainer>
          )}

          {activeTab === "charts" && (
            <AnimatedContainer animationType="slide-up" delay={200}>
              <div className="space-y-8">
                <Charts />
              </div>
            </AnimatedContainer>
          )}

          {activeTab === "data" && (
            <AnimatedContainer animationType="slide-up" delay={200}>
              <DataManagement onSuccess={showSuccess} onError={showError} />
            </AnimatedContainer>
          )}
        </main>

        {/* Footer */}
        <AnimatedContainer animationType="slide-up" delay={300}>
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
                    Created by <span className="text-gold font-pixel">Jordones</span> for the Stormforged Guild •
                    Version <span className="text-gold font-pixel">{packageJson.version}</span>
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </AnimatedContainer>
      </div>
    </>
  );
}
