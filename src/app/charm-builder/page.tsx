import CharmBuilderSimulator from "@/components/CharmBuilderSimulator";
import SiteHeader from "@/components/SiteHeader";
import TopMenu from "@/components/TopMenu";

export default function CharmBuilderPage() {
  return (
    <>
      <SiteHeader />
      <TopMenu />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <CharmBuilderSimulator />
      </main>
    </>
  );
}
