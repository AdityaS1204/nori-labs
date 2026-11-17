import { LabActionsProvider } from "@/components/playground/LabActionsProvider";
import LabNav from "./LabNav";

export const metadata = { title: "Expression Lab — Nori Robotics" };

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <LabActionsProvider>
      <div className="flex flex-col h-screen bg-[#0a0a0b] overflow-hidden">
        <LabNav />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </LabActionsProvider>
  );
}
