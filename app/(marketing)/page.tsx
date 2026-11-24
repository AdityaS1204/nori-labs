import Closing from "@/components/marketing/Closing";
import FeatureBento from "@/components/marketing/FeatureBento";
import Hardware from "@/components/marketing/Hardware";
import Hero from "@/components/marketing/Hero";
import WhatItIs from "@/components/marketing/WhatItIs";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatItIs />
      <FeatureBento />
      <Hardware />
      <Closing />
    </>
  );
}
