import { Superhero } from '@prisma/client';

export type SuperheroWithImages = Superhero & { images: { url: string }[] };
