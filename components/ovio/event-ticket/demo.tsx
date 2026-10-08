"use client";

import { EventTicket, type TicketEvent } from "./event-ticket";

const FRAME: TicketEvent = {
  name: "FRAME/26",
  title: "Get early access",
  date: "2026-10-28",
  venue: "Lisbon + online",
  tier: "Early bird",
  price: "$179",
  description:
    "Two days on interface engineering: motion, rendering and the craft of building things that feel right.",
  schedule: [
    { time: "09:30", title: "Doors & coffee" },
    { time: "10:15", title: "Keynote: Motion as material" },
    { time: "13:00", title: "Workshops: shaders, springs, type" },
    { time: "18:30", title: "Afterparty at the river" },
  ],
};

const reserve = () => new Promise<void>((resolve) => setTimeout(resolve, 1400));

export function EventTicketDemo() {
  return <EventTicket event={FRAME} ticketId="FRM-260918" onBook={reserve} />;
}
