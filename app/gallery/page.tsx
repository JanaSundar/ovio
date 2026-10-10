import type { Metadata } from "next";
import { GalleryBoard } from "@/components/site/gallery-board";
import { SiteFooter } from "@/components/site/site-nav";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Every Ovio component, live. Switch between Minimal, Craft, Retro, and Toy, then copy the install command.",
};

export default function GalleryPage() {
  return (
    <>
      <GalleryBoard />
      <SiteFooter note="Every component. Four worlds." />
    </>
  );
}
