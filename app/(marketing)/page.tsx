import Closing from "@/components/marketing/Closing";
import Hardware from "@/components/marketing/Hardware";
import Hero from "@/components/marketing/Hero";
import Limits from "@/components/marketing/Limits";
import TeachIt from "@/components/marketing/TeachIt";
import TheFace from "@/components/marketing/TheFace";
import WhatItIs from "@/components/marketing/WhatItIs";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatItIs />
      <TeachIt />
      <TheFace />
      <Hardware />
      <Limits />
      <Closing />
    </>
  );
}
