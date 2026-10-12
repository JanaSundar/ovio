/** One issue of a newsletter, written as a letter. */
export type LetterContent = {
  /** The newsletter's name, on the letterhead. */
  name: string;
  /** The issue number: 42 prints as "No. 042". */
  issue: number;
  /** An ISO date ("2026-10-09") is formatted for you; anything else is shown as given. */
  date: string;
  /** Defaults to "Dear reader,". */
  greeting?: string;
  /** The letter itself, one string per paragraph. */
  body: string[];
  /** The line above the signature, e.g. "Until next Thursday,". */
  signOff?: string;
  signature: string;
};

/** Where the P.S. stands: being filled in, waiting on onSubscribe, or sent. */
export type LetterStatus = "idle" | "sending" | "sent";
