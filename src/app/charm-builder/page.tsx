import { Suspense } from "react";
import CharmBuilderSimulator from "@/components/CharmBuilderSimulator";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import TopMenu from "@/components/TopMenu";

export default function CharmBuilderPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="h-16 bg-[#1A1A1A] border-b-2 border-mystic-blue animate-pulse"></div>}>
        <TopMenu />
      </Suspense>
      <main className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8">
        <CharmBuilderSimulator />
      </main>
      <Footer />
    </>
  );
}
