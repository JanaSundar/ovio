"use client";

import { type ComponentType, type FormEvent, useState } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { everyWorld, type InstalledWorld } from "@/lib/world";
import { formatDate, PAD3 } from "@/lib/format";
import { isEmail } from "./send";
import type { LetterContent, LetterStatus } from "./types";
import * as worlds from "./worlds";

export type { LetterContent, LetterStatus } from "./types";

export type LetterProps = {
  letter: LetterContent;
  variant?: InstalledWorld<typeof worlds>;
  /** Readers before this one, printed under the P.S. One is added when the letter is sent. */
  subscribers?: number;
  /** Called with the email from the P.S.; the letter goes out once it resolves, and a rejection shows its message. */
  onSubscribe?: (email: string) => Promise<void> | void;
  className?: string;
};

/** Everything a world needs to draw the letter. Worlds only render and animate; state lives here. */
export type LetterWorldProps = {
  name: string;
  /** "042", and the one after it, "043". */
  issue: string;
  nextIssue: string;
  /** "Oct 9, 2026", and the ISO date for <time> when one was given. */
  date: string;
  dateTime?: string;
  greeting: string;
  body: string[];
  signOff?: string;
  signature: string;
  /** Including the new reader once sent; absent when not given. */
  subscribers?: number;
  status: LetterStatus;
  email: string;
  setEmail: (email: string) => void;
  /** The address the letter went to, once sent. */
  sentTo: string;
  /** Validation or onSubscribe error, and a counter that changes on every failed attempt. */
  error: string;
  errorCount: number;
  submit: (event?: FormEvent) => void;
  className?: string;
};

/** The installed worlds; a single-world install draws its one world for any provider world. */
const VIEWS = everyWorld<ComponentType<LetterWorldProps>>(worlds);

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

export function Letter({ letter, variant, subscribers, onSubscribe, className }: LetterProps) {
  const world = useWorld(variant);
  const [email, setEmailState] = useState("");
  const [status, setStatus] = useState<LetterStatus>("idle");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [errorCount, setErrorCount] = useState(0);

  const fail = (message: string) => {
    setError(message);
    setErrorCount((n) => n + 1);
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (status !== "idle") return;
    const address = email.trim();
    if (!isEmail(address)) return fail("That email looks off");
    setStatus("sending");
    try {
      await onSubscribe?.(address);
      setSentTo(address);
      setStatus("sent");
    } catch (e) {
      setStatus("idle");
      fail(e instanceof Error ? e.message : "Couldn't send, try again");
    }
  };

  const iso = ISO_DAY.test(letter.date) ? letter.date.slice(0, 10) : undefined;
  const props: LetterWorldProps = {
    name: letter.name,
    issue: letter.issue.toLocaleString("en-US", PAD3),
    nextIssue: (letter.issue + 1).toLocaleString("en-US", PAD3),
    date: iso ? formatDate(iso) : letter.date,
    dateTime: iso,
    greeting: letter.greeting ?? "Dear reader,",
    body: letter.body,
    signOff: letter.signOff,
    signature: letter.signature,
    subscribers: subscribers === undefined ? undefined : subscribers + (status === "sent" ? 1 : 0),
    status,
    email,
    setEmail: (value) => {
      setEmailState(value);
      setError("");
    },
    sentTo,
    error,
    errorCount,
    submit,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
