import { create } from 'zustand';
import {
  fetchSuperheroesAPI,
  fetchSuperheroByIdAPI,
  createSuperheroAPI,
  updateSuperheroAPI,
  deleteSuperheroAPI,
  uploadImageAPI,
} from '../services/superhero.service';
import type {
  CreateSuperheroDto,
  SuperheroWithImages,
  UpdateSuperheroDto,
} from '../types/superhero.types';

interface SuperheroState {
  superheroes: SuperheroWithImages[];
  selectedSuperhero: SuperheroWithImages | null;
  totalHeroes: number;
  currentPage: number;
  limit: number;
  loading: {
    list: boolean;
    details: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    upload: boolean;
  };
  error: string | null;
}

interface SuperheroActions {
  fetchSuperheroes: (page?: number, limit?: number) => Promise<void>;
  fetchSuperheroById: (id: string) => Promise<void>;
  createSuperhero: (data: CreateSuperheroDto) => Promise<SuperheroWithImages | undefined>;
  updateSuperhero: (id: string, data: UpdateSuperheroDto) => Promise<void>;
  deleteSuperhero: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string | undefined>;
  clearSelectedSuperhero: () => void;
  setError: (message: string | null) => void;
}

const initialState: SuperheroState = {
  superheroes: [],
  selectedSuperhero: null,
  totalHeroes: 0,
  currentPage: 1,
  limit: 5,
  loading: {
    list: false,
    details: false,
    create: false,
    update: false,
    delete: false,
    upload: false,
  },
  error: null,
};

export const useSuperhero = create<SuperheroState & SuperheroActions>((set, get) => ({
  ...initialState,

  setError: (message) => set({ error: message }),

  clearSelectedSuperhero: () => set({ selectedSuperhero: null }),

  fetchSuperheroes: async (page, limit) => {
    const currentPage = page ?? get().currentPage;
    const currentLimit = limit ?? get().limit;

    set(state => ({ ...state, loading: { ...state.loading, list: true }, error: null }));
    try {
      const { items, total } = await fetchSuperheroesAPI(currentPage, currentLimit);
      set({
        superheroes: items,
        totalHeroes: total,
        currentPage,
        limit: currentLimit,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch superheroes';
      set({ error: message });
    } finally {
      set(state => ({ ...state, loading: { ...state.loading, list: false } }));
    }
  },

  fetchSuperheroById: async (id) => {
    set(state => ({ ...state, loading: { ...state.loading, details: true }, error: null }));
    try {
      const hero = await fetchSuperheroByIdAPI(id);
      set({ selectedSuperhero: hero });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch superhero details';
      set({ error: message, selectedSuperhero: null });
    } finally {
      set(state => ({ ...state, loading: { ...state.loading, details: false } }));
    }
  },

  createSuperhero: async (data) => {
    set(state => ({ ...state, loading: { ...state.loading, create: true }, error: null }));
    try {
      return await createSuperheroAPI(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create superhero';
      set({ error: message });
    } finally {
      set(state => ({ ...state, loading: { ...state.loading, create: false } }));
    }
  },

  updateSuperhero: async (id, data) => {
    set(state => ({ ...state, loading: { ...state.loading, update: true }, error: null }));
    try {
      const updatedHero = await updateSuperheroAPI(id, data);
      set(state => ({
        superheroes: state.superheroes.map(hero => hero.id === id ? { ...hero, ...updatedHero } : hero),
        selectedSuperhero: state.selectedSuperhero?.id === id ? { ...state.selectedSuperhero, ...updatedHero } : state.selectedSuperhero,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update superhero.';
      set({ error: message });
    } finally {
      set(state => ({ ...state, loading: { ...state.loading, update: false } }));
    }
  },

  deleteSuperhero: async (id) => {
    set(state => ({ ...state, loading: { ...state.loading, delete: true }, error: null }));
    try {
      await deleteSuperheroAPI(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete superhero.';
      set({ error: message });
    } finally {
      set(state => ({ ...state, loading: { ...state.loading, delete: false } }));
    }
  },

  uploadImage: async (file) => {
    set(state => ({ ...state, loading: { ...state.loading, upload: true }, error: null }));
    try {
      const { url } = await uploadImageAPI(file);
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image.';
      set({ error: message });
    } finally {
      set(state => ({ ...state, loading: { ...state.loading, upload: false } }));
    }
  },
}));