export interface HeroImage {
  id: string;
  url: string;
}

export interface Superhero {
  id: string;
  nickname: string;
  realName: string;
  originDescription: string;
  superpowers: string[];
  catchPhrase: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperheroWithImages extends Superhero {
  images: { url: string }[];
}

export interface CreateSuperheroDto {
  nickname: string;
  realName: string;
  originDescription: string;
  superpowers: string[];
  catchPhrase: string;
  images?: string[];
}

export type UpdateSuperheroDto = Partial<CreateSuperheroDto>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}