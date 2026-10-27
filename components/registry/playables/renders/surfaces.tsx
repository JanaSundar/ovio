"use client";

import { useState } from "react";
import { Changelog } from "@/components/ovio/changelog/changelog";
import { RELEASES } from "@/components/ovio/changelog/demo";
import { DeveloperIdCard } from "@/components/ovio/developer-id-card/developer-id-card";
import { EventTicket } from "@/components/ovio/event-ticket/event-ticket";
import { FRAME, reserve } from "@/components/ovio/event-ticket/demo";
import { Letter } from "@/components/ovio/letter/letter";
import { ISSUE, subscribe } from "@/components/ovio/letter/demo";
import { NowPlaying } from "@/components/ovio/now-playing/now-playing";
import { QUEUE } from "@/components/ovio/now-playing/demo";
import { RepositoryCard } from "@/components/ovio/repository-card/repository-card";
import { SponsorWall } from "@/components/ovio/sponsor-wall/sponsor-wall";
import { SPONSORS } from "@/components/ovio/sponsor-wall/demo";
import { SAMPLE_DEVELOPER, SAMPLE_REPOSITORY } from "@/content/samples";
import { renderer, type Renders } from "./types";

/** The repository card with its star wired up, starting where the control says. */
function Repository({ starred, ...p }: { starred: boolean }) {
  const [on, setOn] = useState(starred);
  const [seen, setSeen] = useState(starred);
  if (seen !== starred) {
    setSeen(starred);
    setOn(starred);
  }
  return (
    <RepositoryCard repository={SAMPLE_REPOSITORY} starred={on} onStarredChange={setOn} {...p} />
  );
}

/** Now Playing on the sample queue, with previous and next working. */
function Player(p: Record<string, unknown>) {
  const [index, setIndex] = useState(0);
  const step = (by: number) => setIndex((i) => (i + by + QUEUE.length) % QUEUE.length);
  return (
    <NowPlaying
      track={QUEUE[index]}
      defaultProgress={134}
      onPrevious={() => step(-1)}
      onNext={() => step(1)}
      {...p}
    />
  );
}

const RENDERS: Renders = {
  "repository-card": (p) => <Repository {...p} />,
  "event-ticket": (p) => (
    <EventTicket event={FRAME} ticketId="FRM-260918" onBook={reserve} {...p} />
  ),
  changelog: (p) => <Changelog releases={RELEASES} {...p} />,
  "sponsor-wall": (p) => (
    <SponsorWall sponsors={SPONSORS} ctaHref="https://janasundar.vercel.app" {...p} />
  ),
  letter: (p) => <Letter letter={ISSUE} onSubscribe={subscribe} {...p} />,
  "now-playing": (p) => <Player {...p} />,
  "developer-id-card": (p) => (
    <DeveloperIdCard {...SAMPLE_DEVELOPER} url="https://janasundar.vercel.app" {...p} />
  ),
};

export default renderer(RENDERS);
