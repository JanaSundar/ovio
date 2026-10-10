export type Track = {
  title: string;
  artist: string;
  album?: string;
  /** Length in seconds. */
  duration: number;
  /** Cover image. Leave out and a printed placeholder is drawn. */
  artwork?: string;
};
