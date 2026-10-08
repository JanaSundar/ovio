import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Caveat,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  VT323,
} from "next/font/google";
import { SiteWorldProvider } from "@/components/site/site-world";
import "@/styles/globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: "400" });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });

const fonts = [geist, geistMono, bricolage, plexMono, caveat, vt323, archivo]
  .map((f) => f.variable)
  .join(" ");

const description =
  "Expressive motion components for developer websites, each in four design worlds: Minimal, Craft, Retro and Toy. Install it, own the source.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ovioui.vercel.app"),
  title: { default: "Ovio · The motion layer for developer websites", template: "%s · Ovio" },
  description,
  applicationName: "Ovio",
  openGraph: {
    type: "website",
    siteName: "Ovio",
    title: "Ovio · The motion layer for developer websites",
    description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fonts}>
      <body>
        <SiteWorldProvider>{children}</SiteWorldProvider>
      </body>
    </html>
  );
}
