import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import TopMenu from "@/components/TopMenu";

export default function CalculatorPage() {
  return (
    <>
      <div className="min-h-screen bg-battlefield">
        <SiteHeader />
        <TopMenu />
        <main className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-6 mb-6 transition-all duration-300 hover:border-gold">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="icon-rpg pixel-glow text-2xl">🧠</div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-pixel text-gold text-glow">Calculator</h1>
                    <div className="text-text-muted font-pixel-operator text-sm">Idle Horizon Theorycrafting</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-6 transition-all duration-300 hover:border-gold">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-xl font-pixel text-gold text-glow mb-4">Coming Soon</h2>
                <p className="text-text-primary font-pixel-operator text-sm max-w-md mx-auto">
                  Advanced theorycrafting tools for builds will appear here. Plan your builds, calculate optimal stats,
                  and maximize your potential!
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
