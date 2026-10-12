import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LetterWorldProps } from "./letter";

/** Class names for each piece of the P.S., so every world styles the same form. */
export type PostscriptLook = {
  form?: string;
  row?: string;
  label?: string;
  lead?: string;
  input?: string;
  button?: string;
  error?: string;
};

type PostscriptProps = {
  p: LetterWorldProps;
  look: PostscriptLook;
  /** The line after "P.S.", e.g. "Want the next one?". */
  lead: ReactNode;
  placeholder?: string;
  /** The send button's label; leave it out for a form that sends on Enter. */
  action?: ReactNode;
  /** The button's label while onSubscribe is pending. */
  pending?: ReactNode;
};

/**
 * The subscribe form, written as a postscript. Locked once it is sending; the error is announced
 * and tied to the input, and its key changes on every failed attempt so a world can replay a shake.
 */
export function Postscript({
  p,
  look,
  lead,
  placeholder = "you@domain.com",
  action,
  pending = "Sending…",
}: PostscriptProps) {
  const errorId = useId();
  return (
    <form noValidate onSubmit={p.submit} className={look.form}>
      <div className={look.row}>
        <label htmlFor={`${errorId}-email`} className="contents">
          <span className={look.label}>P.S.</span>
          <span className={look.lead}>{lead}</span>
        </label>
        <input
          id={`${errorId}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={p.email}
          readOnly={p.status !== "idle"}
          onChange={(e) => p.setEmail(e.target.value)}
          placeholder={placeholder}
          aria-invalid={p.error ? true : undefined}
          aria-describedby={p.error ? errorId : undefined}
          className={cn("min-w-0 flex-1 bg-transparent outline-none", look.input)}
        />
        {action && (
          <button
            type="submit"
            disabled={p.status !== "idle"}
            className={cn("shrink-0 cursor-pointer disabled:cursor-default", look.button)}
          >
            {p.status === "sending" ? pending : action}
          </button>
        )}
      </div>
      <p id={errorId} role="alert" key={p.errorCount} className={cn("m-0", look.error)}>
        {p.error}
      </p>
    </form>
  );
}

/** The issue's paragraphs. */
export function Paragraphs({ body, className }: { body: string[]; className?: string }) {
  return body.map((text, i) => (
    <p key={i} className={cn("m-0", className)}>
      {text}
    </p>
  ));
}

/** Says the letter went out, for screen readers: the worlds show it with pictures. */
export function SentNotice({ p }: { p: LetterWorldProps }) {
  return (
    <p role="status" className="sr-only">
      {p.status === "sent" ? `Sent. ${p.name} No. ${p.nextIssue} goes to ${p.sentTo}.` : ""}
    </p>
  );
}
