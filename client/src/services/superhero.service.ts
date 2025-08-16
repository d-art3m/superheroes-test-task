import apiClient from './api';
import type {
  CreateSuperheroDto,
  PaginatedResult,
  SuperheroWithImages,
  UpdateSuperheroDto,
} from '../types/superhero.types';

const SUPERHEROES_ENDPOINT = '/superheroes';
const UPLOAD_ENDPOINT = '/upload';

export const fetchSuperheroesAPI = async (page: number, limit: number) => {
  const response = await apiClient.get<PaginatedResult<SuperheroWithImages>>(
    SUPERHEROES_ENDPOINT,
    { params: { page, limit } },
  );
  return response.data;
};

export const fetchSuperheroByIdAPI = async (id: string) => {
  const response = await apiClient.get<SuperheroWithImages>(`${SUPERHEROES_ENDPOINT}/${id}`);
  return response.data;
};

export const createSuperheroAPI = async (data: CreateSuperheroDto) => {
  const response = await apiClient.post<SuperheroWithImages>(SUPERHEROES_ENDPOINT, data);
  return response.data;
};

export const updateSuperheroAPI = async (id: string, data: UpdateSuperheroDto) => {
  const response = await apiClient.patch<SuperheroWithImages>(`${SUPERHEROES_ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteSuperheroAPI = async (id: string) => {
  const response = await apiClient.delete(`${SUPERHEROES_ENDPOINT}/${id}`);
  return response.data;
};

export const uploadImageAPI = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(UPLOAD_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};