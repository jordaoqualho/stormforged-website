"use client";

import { useEffect, useState } from "react";

interface InitialLoadingScreenProps {
  onComplete: () => void;
}

export default function InitialLoadingScreen({ onComplete }: InitialLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing Stormforged...");

  const loadingSteps = [
    { text: "Initializing Stormforged...", duration: 800 },
    { text: "Loading battle data...", duration: 600 },
    { text: "Preparing command center...", duration: 500 },
    { text: "Activating guild systems...", duration: 400 },
    { text: "Ready for battle!", duration: 300 },
  ];

  useEffect(() => {
    let currentStep = 0;
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const updateProgress = () => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    };

    const nextStep = () => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text);
        currentStep++;
        stepTimeout = setTimeout(nextStep, loadingSteps[currentStep - 1].duration);
      }
    };

    // Start the loading process
    progressInterval = setInterval(updateProgress, 50);
    stepTimeout = setTimeout(nextStep, 100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-battlefield flex items-center justify-center z-[9999]">
      <div className="text-center animate-initial-load">
        {/* Main Logo */}
        <div className="relative mb-8">
          <div className="icon-rpg text-8xl mb-4 animate-pulse-glow">🏰</div>
          <div className="absolute inset-0 icon-rpg text-8xl animate-ping opacity-20">🏰</div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-pixel text-gold text-glow mb-2 animate-fade-in">
          Stormforged
        </h1>
        <p className="text-lg text-text-secondary font-pixel-operator mb-8 animate-fade-in">
          Idle Horizon Guild War Command Center
        </p>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="loading-rpg w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gold font-pixel-operator text-lg animate-pulse">
            {loadingText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="progress-rpg h-4">
            <div 
              className="progress-rpg-fill bg-gradient-to-r from-gold to-yellow-400"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-text-muted font-pixel-operator">Loading...</span>
            <span className="text-xs text-gold font-pixel">{progress}%</span>
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-gold rounded-full animate-bounce-gentle"></div>
          <div className="w-3 h-3 bg-gold rounded-full animate-bounce-gentle" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-gold rounded-full animate-bounce-gentle" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Battle Stats Preview */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-2xl font-pixel text-gold">⚔️</div>
            <div className="text-xs text-text-muted font-pixel-operator">Battle Log</div>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-2xl font-pixel text-gold">📊</div>
            <div className="text-xs text-text-muted font-pixel-operator">Analytics</div>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-2xl font-pixel text-gold">🏆</div>
            <div className="text-xs text-text-muted font-pixel-operator">Achievements</div>
          </div>
        </div>
      </div>
    </div>
  );
}
