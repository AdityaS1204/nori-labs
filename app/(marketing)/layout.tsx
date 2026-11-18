import TabNav from "@/components/marketing/TabNav";
import SiteFooter from "@/components/marketing/SiteFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display">
      <TabNav />
      <main className="flex-1 pt-0">{children}</main>
      <SiteFooter />
    </div>
  );
}
