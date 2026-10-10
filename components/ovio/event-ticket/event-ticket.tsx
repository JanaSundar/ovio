"use client";

import { type ComponentType, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { formatDate, formatShortDate } from "@/lib/format";
import { hashString } from "./seed";
import { MinimalEventTicket } from "./worlds/minimal";
import { CraftEventTicket } from "./worlds/craft";
import { RetroEventTicket } from "./worlds/retro";
import { ToyEventTicket } from "./worlds/toy";
import type { TicketEvent, Attendee } from "./types";

export type { TicketEvent, Attendee } from "./types";

export type TicketLayout = "horizontal" | "vertical";

export type EventTicketProps = {
  event: TicketEvent;
  variant?: World;
  /** Side stub or tear-off bottom. Horizontal turns vertical when there is no room for it. */
  layout?: TicketLayout;
  /** Ticket number, printed on the stub and encoded in the QR code. */
  ticketId?: string;
  /** Starts the ticket already booked to this person. */
  defaultAttendee?: Attendee;
  /** Called with the name and email when the book button is pressed; the button waits on it. */
  onBook?: (attendee: Attendee) => Promise<void> | void;
  /** Fires when the stub is torn off, with the attendee once booked. */
  onTear?: (attendee: Attendee | null) => void;
  /** Controlled flip state: true shows the back with the QR code. */
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  className?: string;
};

export type TicketStatus = "form" | "sending" | "booked";

/** Everything a world needs to draw the ticket. Worlds only render; state lives here. */
export type EventTicketWorldProps = {
  event: TicketEvent;
  ticketId: string;
  /** The layout in use, after falling back to vertical in a narrow container. */
  layout: TicketLayout;
  rootRef: RefObject<HTMLDivElement | null>;
  date: string;
  shortDate: string;
  status: TicketStatus;
  attendee: Attendee | null;
  draft: Attendee;
  setDraft: (field: keyof Attendee, value: string) => void;
  /** Validation or booking error, and a counter that changes on every failed attempt. */
  error: string;
  errorCount: number;
  book: () => void;
  torn: boolean;
  tear: () => void;
  flipped: boolean;
  flip: () => void;
  /** Seeds the generative art, from the name being typed. */
  seed: number;
  className?: string;
};

/** Below this width a horizontal ticket would be cramped, so it turns vertical. */
const HORIZONTAL_MIN = 600;
const EMAIL = /^\S+@\S+\.\S+$/;

function useFitLayout(layout: TicketLayout) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < HORIZONTAL_MIN));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, layout === "horizontal" && !narrow ? "horizontal" : "vertical"] as const;
}

const VIEWS = {
  minimal: MinimalEventTicket,
  craft: CraftEventTicket,
  retro: RetroEventTicket,
  toy: ToyEventTicket,
} satisfies Record<World, ComponentType<EventTicketWorldProps>>;

/** An ISO date-time's calendar day as written, so its own time zone decides the day. */
const wallDate = (date: string) => (/^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : date);

export function EventTicket({
  event,
  variant,
  layout: layoutProp = "horizontal",
  ticketId,
  defaultAttendee,
  onBook,
  onTear,
  flipped: flippedProp,
  defaultFlipped = false,
  onFlippedChange,
  className,
}: EventTicketProps) {
  const world = useWorld(variant);
  const [rootRef, layout] = useFitLayout(layoutProp);
  const [attendee, setAttendee] = useState<Attendee | null>(defaultAttendee ?? null);
  const [draft, setDraftState] = useState<Attendee>(defaultAttendee ?? { name: "", email: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [torn, setTorn] = useState(false);
  const [flippedState, setFlippedState] = useState(defaultFlipped);
  const flipped = flippedProp ?? flippedState;

  const fail = (message: string) => {
    setError(message);
    setErrorCount((n) => n + 1);
  };

  const book = async () => {
    if (sending || attendee) return;
    const next = { name: draft.name.trim(), email: draft.email.trim() };
    if (!next.name) return fail("Add your name");
    if (!EMAIL.test(next.email)) return fail("That email looks off");
    setSending(true);
    try {
      await onBook?.(next);
      setAttendee(next);
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not book, try again");
    } finally {
      setSending(false);
    }
  };

  const tear = () => {
    if (torn) return;
    setTorn(true);
    onTear?.(attendee);
  };

  const flip = () => {
    if (flippedProp === undefined) setFlippedState(!flipped);
    onFlippedChange?.(!flipped);
  };

  const props: EventTicketWorldProps = {
    event,
    ticketId: ticketId ?? `TKT-${String(hashString(event.name) % 1e6).padStart(6, "0")}`,
    layout,
    rootRef,
    // The day printed is the day at the venue: "2027-03-14T19:00-07:00" is March 14 there,
    // though it's already the 15th in UTC.
    date: formatDate(wallDate(event.date)),
    shortDate: formatShortDate(wallDate(event.date)),
    status: attendee ? "booked" : sending ? "sending" : "form",
    attendee,
    draft,
    setDraft: (field, value) => {
      setDraftState((d) => ({ ...d, [field]: value }));
      setError("");
    },
    error,
    errorCount,
    book,
    torn,
    tear,
    flipped,
    flip,
    seed: hashString((attendee?.name ?? draft.name).trim().toLowerCase() || "guest"),
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
