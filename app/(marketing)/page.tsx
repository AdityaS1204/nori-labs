import Capabilities from "@/components/marketing/Capabilities";
import FaqAndClosing from "@/components/marketing/FaqAndClosing";
import HardwareDetails from "@/components/marketing/HardwareDetails";
import Hero from "@/components/marketing/Hero";
import InContext from "@/components/marketing/InContext";
import TeachingFlow from "@/components/marketing/TeachingFlow";

export default function Home() {
  return (
    <>
      <Hero />
      <InContext />
      <Capabilities />
      <TeachingFlow />
      <HardwareDetails />
      <FaqAndClosing />
    </>
  );
}
