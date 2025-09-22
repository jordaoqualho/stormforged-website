"use client";

import { useEffect, useState } from "react";

interface InitialLoadingScreenProps {
  onComplete: () => void;
  minDuration?: number; // Minimum duration in milliseconds
}

export default function InitialLoadingScreen({ onComplete, minDuration = 4000 }: InitialLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing Stormforged...");
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const loadingSteps = [
      { text: "Initializing Stormforged...", duration: 1000 },
      { text: "Loading battle data...", duration: 800 },
      { text: "Preparing command center...", duration: 700 },
      { text: "Activating guild systems...", duration: 600 },
      { text: "Synchronizing warriors...", duration: 500 },
      { text: "Ready for battle!", duration: 400 },
    ];

    let currentStep = 0;
    let stepTimeout: NodeJS.Timeout;
    let isCompleted = false;

    const completeLoading = () => {
      if (!isCompleted) {
        isCompleted = true;
        setIsCompleting(true);
        setLoadingText("Welcome to Stormforged!");
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    };

    const updateProgress = () => {
      setProgress((prev) => {
        const newProgress = prev + 1.3; // Adjusted to reach 100% in ~4.6 seconds
        if (newProgress >= 100 && !isCompleted) {
          // Don't trigger completion here, let minimum duration timer handle it
          return 100;
        }
        return Math.min(newProgress, 100); // Cap at 100
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
    const progressInterval = setInterval(updateProgress, 60);
    stepTimeout = setTimeout(nextStep, 200);

    // Set minimum duration timer as primary completion trigger
    const minDurationTimeout = setTimeout(() => {
      if (!isCompleted) {
        completeLoading();
      }
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
      clearTimeout(minDurationTimeout);
    };
  }, [onComplete, minDuration]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] flex items-center justify-center z-[10001]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-mystic-blue/10 rounded-full animate-pulse blur-xl"></div>
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-gold/10 rounded-full animate-pulse blur-xl"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-red-500/10 rounded-full animate-pulse blur-xl"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="text-center animate-initial-load relative z-10">
        {/* Title with Enhanced Styling */}
        <div className="mb-8">
          <h1 className="text-5xl font-pixel text-gold text-glow mb-3 animate-fade-in bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Stormforged
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4"></div>
          <p className="text-xl text-text-secondary font-pixel-operator animate-fade-in">Guild War Command Center</p>
          <p className="text-sm text-text-muted font-pixel-operator mt-2 animate-fade-in">
            Idle Horizon • Battle Analytics & Strategy
          </p>
        </div>

        {/* Enhanced Loading Animation */}
        <div className="mb-8">
          <div className="relative mb-6">
            {/* Custom Loading Spinner */}
            <div className="w-20 h-20 mx-auto relative">
              <div
                className={`absolute inset-0 border-4 border-gold/20 rounded-full ${
                  isCompleting ? "animate-pulse-glow" : ""
                }`}
              ></div>
              <div
                className="absolute inset-0 border-4 border-transparent border-t-gold rounded-full animate-spin"
                style={{ animationDuration: "1s" }}
              ></div>
              <div
                className="absolute inset-2 border-2 border-transparent border-b-mystic-blue rounded-full animate-spin"
                style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
              ></div>
            </div>
          </div>

          {/* Loading Text with Typewriter Effect */}
          <div className="min-h-[2.5rem] flex items-center justify-center">
            <p
              className={`font-pixel-operator text-xl transition-all duration-500 ${
                isCompleting ? "text-gold animate-pulse-glow" : "text-gold animate-pulse"
              }`}
            >
              {loadingText}
              <span className="animate-blink text-gold">|</span>
            </p>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="progress-rpg h-6 rounded-full overflow-hidden border border-gold/20">
              <div
                className={`h-full transition-all duration-300 ease-out ${
                  isCompleting
                    ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                    : "bg-gradient-to-r from-gold via-yellow-400 to-yellow-500"
                }`}
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>

            {/* Progress Text */}
            <div className="flex justify-between mt-3">
              <span
                className={`text-sm font-pixel-operator transition-colors duration-300 ${
                  isCompleting ? "text-green-400" : "text-text-muted"
                }`}
              >
                {isCompleting ? "✓ Complete!" : "Loading systems..."}
              </span>
              <span
                className={`text-sm font-pixel transition-colors duration-300 ${
                  isCompleting ? "text-green-400" : "text-gold"
                }`}
              >
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Animated Indicators */}
        <div className="flex justify-center space-x-3 mb-12">
          <div
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              progress > 25 ? "bg-gold animate-pulse" : "bg-gold/30"
            }`}
          ></div>
          <div
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              progress > 50 ? "bg-mystic-blue animate-pulse" : "bg-mystic-blue/30"
            }`}
          ></div>
          <div
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              progress > 75 ? "bg-green-400 animate-pulse" : "bg-green-400/30"
            }`}
          ></div>
        </div>

        {/* Enhanced Feature Preview */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div className="text-center animate-fade-in group" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="text-3xl font-pixel text-gold group-hover:text-yellow-300 transition-colors duration-300 mb-2">
                ⚔️
              </div>
              <div className="absolute inset-0 text-3xl animate-ping opacity-20">⚔️</div>
            </div>
            <div className="text-xs text-text-muted font-pixel-operator group-hover:text-text-secondary transition-colors">
              Battle Log
            </div>
            <div className="text-xs text-gold/60 font-pixel-operator mt-1">Track Wars</div>
          </div>

          <div className="text-center animate-fade-in group" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              <div className="text-3xl font-pixel text-mystic-blue group-hover:text-blue-300 transition-colors duration-300 mb-2">
                📊
              </div>
              <div className="absolute inset-0 text-3xl animate-ping opacity-20">📊</div>
            </div>
            <div className="text-xs text-text-muted font-pixel-operator group-hover:text-text-secondary transition-colors">
              Analytics
            </div>
            <div className="text-xs text-mystic-blue/60 font-pixel-operator mt-1">Data Insights</div>
          </div>

          <div className="text-center animate-fade-in group" style={{ animationDelay: "0.5s" }}>
            <div className="relative">
              <div className="text-3xl font-pixel text-green-400 group-hover:text-green-300 transition-colors duration-300 mb-2">
                🏆
              </div>
              <div className="absolute inset-0 text-3xl animate-ping opacity-20">🏆</div>
            </div>
            <div className="text-xs text-text-muted font-pixel-operator group-hover:text-text-secondary transition-colors">
              Achievements
            </div>
            <div className="text-xs text-green-400/60 font-pixel-operator mt-1">Milestones</div>
          </div>
        </div>

        {/* Loading Status Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2 text-xs text-text-muted font-pixel-operator">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
            <span>Preparing your command center...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
