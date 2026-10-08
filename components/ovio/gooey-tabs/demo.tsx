"use client";

import { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import { GooeyTabs, type GooeyStatus } from "./gooey-tabs";

const TABS = ["Overview", "Commits", "Issues", "Releases"];
const PANELS = [
  "README · 4 min read",
  "1,248 commits on main",
  "37 open · 412 closed",
  "v2.4.0 is latest",
];
const STATUSES: GooeyStatus[] = ["offline", "building", "online"];

export function GooeyTabsDemo() {
  const [status, setStatus] = useState(1);
  const reduced = useReducedMotionSafe();
  // The deploy status cycles so every state can be seen; it holds on "building" under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStatus((s) => (s + 1) % STATUSES.length), 2400);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <GooeyTabs tabs={TABS} panels={PANELS} status={STATUSES[status]} label="Repository sections" />
  );
}
