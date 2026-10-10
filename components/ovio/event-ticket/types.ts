export type TicketEvent = {
  /** Short name, e.g. "FRAME/26". */
  name: string;
  /** ISO 8601 date. */
  date: string;
  venue?: string;
  /** Headline on the ticket. Defaults to the name. */
  title?: string;
  description?: string;
  /** Ticket type, e.g. "Early bird". */
  tier?: string;
  /** Printed as given, e.g. "$179". */
  price?: string;
  /** Printed on the back, beside the QR code. */
  schedule?: { time: string; title: string }[];
};

export type Attendee = { name: string; email: string };
