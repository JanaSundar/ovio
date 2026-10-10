"use client";

import { SAMPLE_DEVELOPER } from "@/content/samples";
import { DeveloperIdCard } from "./developer-id-card";

export function DeveloperIdCardDemo() {
  return <DeveloperIdCard {...SAMPLE_DEVELOPER} url="https://janasundar.vercel.app" />;
}
