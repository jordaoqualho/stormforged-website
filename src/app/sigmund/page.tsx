import SiteHeader from "@/components/SiteHeader";
import TopMenu from "@/components/TopMenu";

export default function CalculatorPage() {
  return (
    <>
      <SiteHeader />
      <TopMenu />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="icon-rpg pixel-glow text-2xl">🧠</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-pixel text-gold text-glow">Calculator</h1>
                <div className="text-text-muted font-pixel-operator text-sm">Idle Horizon Theorycrafting</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="card-rpg bg-battlefield p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-pixel text-gold text-glow mb-4">Coming Soon</h2>
              <p className="text-text-primary font-pixel-operator text-sm max-w-md mx-auto">
                Advanced theorycrafting tools for builds will appear here. Plan your builds, calculate optimal
                stats, and maximize your potential!
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
