"use client";

import packageJson from "../../package.json";
import AnimatedContainer from "./AnimatedContainer";

export default function Footer() {
  return (
    <AnimatedContainer animationType="slide-up" delay={300}>
      <footer className="bg-gradient-to-r from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] border-t-2 border-mystic-blue mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="icon-rpg text-3xl mb-2">🏰</div>
              <h3 className="font-pixel text-gold mb-2">Stormforged</h3>
              <p className="text-xs text-text-muted font-pixel-operator">Idle Horizon Guild Manager and Tools</p>
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
                Created by <span className="text-gold font-pixel">Jordones</span> for the Stormforged Guild • Version{" "}
                <span className="text-gold font-pixel">{packageJson.version}</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </AnimatedContainer>
  );
}
