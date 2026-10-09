import { demoResponse } from "@/lib/demo-data";

// What's playing changes by the minute, so this answers from a 30-second cache, not the hour.
export const revalidate = 30;

export const GET = () => demoResponse("now-playing");
