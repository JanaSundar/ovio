import type { ComponentProps } from "react";
import type { PlacedSponsor, SponsorTier } from "./sponsor-wall";

const SPOKEN: Record<SponsorTier, string> = {
  platinum: "platinum sponsor",
  gold: "gold sponsor",
  backer: "backer",
};

/** The sponsor's name; screen readers hear the tier too. */
export function SponsorName({ sponsor }: { sponsor: PlacedSponsor }) {
  return (
    <>
      {sponsor.name}
      <span className="sr-only">, {SPOKEN[sponsor.tier]}</span>
    </>
  );
}

type SponsorLinkProps = Omit<ComponentProps<"a">, "href" | "children"> & {
  sponsor: PlacedSponsor;
};

/** The sponsor's name, linked when it has a url. */
export function SponsorLink({ sponsor, ...props }: SponsorLinkProps) {
  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noreferrer" draggable={false} {...props}>
      <SponsorName sponsor={sponsor} />
    </a>
  ) : (
    <span {...props}>
      <SponsorName sponsor={sponsor} />
    </span>
  );
}
