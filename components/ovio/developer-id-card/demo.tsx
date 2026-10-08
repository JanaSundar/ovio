"use client";

import { DeveloperIdCard } from "./developer-id-card";

export function DeveloperIdCardDemo() {
  return (
    <DeveloperIdCard
      name="Ada Park"
      title="Senior Software Engineer"
      stack={["React", "TypeScript", "Node", "Postgres"]}
      github="ada-dev"
      website="ada.dev"
      url="https://janasundar.vercel.app"
      location="Seoul, Korea"
      available
      serial="024"
      since={2019}
    />
  );
}
