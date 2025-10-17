import { Artist } from '@prisma/client';

export interface ProcessedDBArtist {
  name: string;
  data: Artist;
}
