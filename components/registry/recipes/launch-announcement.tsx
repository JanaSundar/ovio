"use client";

import { useState } from "react";
import { PeelToReveal } from "@/components/interactions/peel-to-reveal/peel-to-reveal";
import {
  Testimonials,
  type Testimonial,
} from "@/components/interactions/testimonials/testimonials";
import { EventTicket } from "@/components/ovio/event-ticket/event-ticket";
import type { TicketEvent } from "@/components/ovio/event-ticket/types";

/*
 * A launch section: book the ticket, and the early-access code under the sticker unlocks; quotes
 * from last year sit beside it. Point `book` at your own endpoint.
 */

const EVENT: TicketEvent = {
  name: "FRAME/26",
  title: "Get early access",
  date: "2026-11-28",
  venue: "Lisbon + online",
  tier: "Early bird",
  price: "$179",
  description:
    "Two days on interface engineering: motion, rendering and the craft of building things that feel right.",
};

const QUOTES: Testimonial[] = [
  {
    quote: "The workshops alone paid for the ticket. I shipped two of the demos the week after.",
    name: "Mei Tanaka",
    role: "Design engineer",
  },
  {
    quote: "The only conference where the slides had better motion than the products.",
    name: "Leo Duarte",
    role: "Staff engineer",
  },
  {
    quote: "Small enough to meet the speakers, big enough to learn something every hour.",
    name: "Priya Raman",
    role: "Founder",
  },
];

/** Stands in for a booking request. */
const book = () => new Promise<void>((resolve) => setTimeout(resolve, 1200));

export function LaunchAnnouncement() {
  const [booked, setBooked] = useState(false);

  return (
    <section aria-label="FRAME/26" className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <EventTicket
        event={EVENT}
        ticketId="FRM-261128"
        onBook={async () => {
          await book();
          setBooked(true);
        }}
      />
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <PeelToReveal
            label="Early-access code"
            hint={booked ? "Peel from the corner" : "Book a ticket to unlock"}
            disabled={!booked}
          >
            <div className="flex size-full flex-col items-center justify-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.18em] text-[#75757f] uppercase">
                Early access
              </span>
              <span className="font-mono text-3xl font-semibold tracking-[0.08em] text-[#ededf0]">
                FRM-EA-26
              </span>
            </div>
          </PeelToReveal>
        </div>
        <Testimonials items={QUOTES} label="From FRAME/25" />
      </div>
    </section>
  );
}
