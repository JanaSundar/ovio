import { AUTHOR_URL, GITHUB_URL } from "@/content/components";

/** Only the production deployment is indexed; previews and local builds are not. */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

export const SITE_DESCRIPTION =
  "Expressive motion components for developer websites, each in four design worlds: Minimal, Craft, Retro and Toy. Install it, own the source.";

const author = { "@type": "Person", name: "Jana", url: AUTHOR_URL };

/** The source code a page documents, as schema.org describes it. */
export const sourceCode = (name: string, description: string, url: string) => ({
  "@type": "SoftwareSourceCode",
  name,
  description,
  url,
  codeRepository: GITHUB_URL,
  programmingLanguage: ["TypeScript", "React"],
  license: "https://opensource.org/licenses/MIT",
  author,
});

/** Structured data for search engines, escaped so a "<" in the content can't close the tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...data,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
