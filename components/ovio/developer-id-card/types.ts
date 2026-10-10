/** The profile a Developer ID Card prints. */
export type Developer = {
  /** Printed name. */
  name: string;
  /** Job title. */
  title?: string;
  /** Technologies, most important first. */
  stack?: string[];
  /** GitHub handle, without the @. The QR code opens this profile unless `url` is set. */
  github?: string;
  /** Personal site, printed without the protocol ("jana.dev"). */
  website?: string;
  /** "Chennai, India". */
  location?: string;
  /** Open to work. Leave out to hide the status. */
  available?: boolean;
  /** Photo. Leave out (or let it fail) and initials are shown instead. */
  avatarUrl?: string;
  /** Card number, e.g. "024". */
  serial?: string;
  /** Year the developer started, printed in Craft ("Est. 2019"). */
  since?: number;
};
