import type { ComponentProps } from "react";
import type { PlacedSponsor, SponsorTier } from "./sponsor-wall";

const SPOKEN: Record<SponsorTier, string> = {
  platinum: "platinum sponsor",
  gold: "gold sponsor",
  backer: "backer",
};

type SponsorLinkProps = Omit<ComponentProps<"a">, "href" | "children"> & {
  sponsor: PlacedSponsor;
};

/** The sponsor's name, linked when it has a url. Screen readers hear the tier too. */
export function SponsorLink({ sponsor, ...props }: SponsorLinkProps) {
  const content = (
    <>
      {sponsor.name}
      <span className="sr-only">, {SPOKEN[sponsor.tier]}</span>
    </>
  );
  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noreferrer" draggable={false} {...props}>
      {content}
    </a>
  ) : (
    <span {...props}>{content}</span>
  );
}
