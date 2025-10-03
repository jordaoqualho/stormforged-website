import CharmBuilderSimulator from "@/components/CharmBuilderSimulator";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import TopMenu from "@/components/TopMenu";

export default function CharmBuilderPage() {
  return (
    <>
      <SiteHeader />
      <TopMenu />
      <main className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8">
        <CharmBuilderSimulator />
      </main>
      <Footer />
    </>
  );
}
