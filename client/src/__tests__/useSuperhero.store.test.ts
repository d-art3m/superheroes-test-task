import { useSuperhero } from '../store/useSuperhero';
import type { CreateSuperheroDto, SuperheroWithImages, UpdateSuperheroDto } from '../types/superhero.types';

jest.mock('../services/superhero.service', () => ({
	fetchSuperheroesAPI: jest.fn(),
	fetchSuperheroByIdAPI: jest.fn(),
	createSuperheroAPI: jest.fn(),
	updateSuperheroAPI: jest.fn(),
	deleteSuperheroAPI: jest.fn(),
	uploadImageAPI: jest.fn(),
}));

import {
	fetchSuperheroesAPI,
	fetchSuperheroByIdAPI,
	createSuperheroAPI,
	updateSuperheroAPI,
	deleteSuperheroAPI,
	uploadImageAPI,
} from '../services/superhero.service';

const asMock = <T extends (...args: any[]) => any>(fn: T) => fn as unknown as jest.MockedFunction<T>;

const getInitialState = () => ({
	superheroes: [] as SuperheroWithImages[],
	selectedSuperhero: null as SuperheroWithImages | null,
	totalHeroes: 0,
	currentPage: 1,
	limit: 5,
	loading: { list: false, details: false, create: false, update: false, delete: false, upload: false },
	error: null as string | null,
});

const heroA: SuperheroWithImages = {
	id: '1',
	nickname: 'Hero A',
	realName: 'Alice',
	originDescription: 'Origin A',
	superpowers: ['fly'],
	catchPhrase: 'Up and away!',
	createdAt: '2025-01-01T00:00:00.000Z',
	updatedAt: '2025-01-01T00:00:00.000Z',
	images: [{ url: 'http://img/a.png' }],
};

const heroB: SuperheroWithImages = {
	id: '2',
	nickname: 'Hero B',
	realName: 'Bob',
	originDescription: 'Origin B',
	superpowers: ['speed'],
	catchPhrase: 'Zoom!',
	createdAt: '2025-01-02T00:00:00.000Z',
	updatedAt: '2025-01-02T00:00:00.000Z',
	images: [{ url: 'http://img/b.png' }],
};

describe('useSuperhero store', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useSuperhero.setState(getInitialState());
	});

	it('fetchSuperheroes success updates list, totals, and pagination; toggles loading', async () => {
		asMock(fetchSuperheroesAPI).mockResolvedValueOnce({ items: [heroA, heroB], total: 2 });

		const promise = useSuperhero.getState().fetchSuperheroes(1, 5);
		expect(useSuperhero.getState().loading.list).toBe(true);
		await promise;

		const state = useSuperhero.getState();
		expect(state.loading.list).toBe(false);
		expect(state.superheroes).toHaveLength(2);
		expect(state.totalHeroes).toBe(2);
		expect(state.currentPage).toBe(1);
		expect(state.limit).toBe(5);
		expect(state.error).toBeNull();
		expect(fetchSuperheroesAPI).toHaveBeenCalledWith(1, 5);
	});

	it('fetchSuperheroes error sets error and toggles loading', async () => {
		asMock(fetchSuperheroesAPI).mockRejectedValueOnce(new Error('network'));

		const promise = useSuperhero.getState().fetchSuperheroes(1, 5);
		expect(useSuperhero.getState().loading.list).toBe(true);
		await promise;

		const state = useSuperhero.getState();
		expect(state.loading.list).toBe(false);
		expect(state.error).toBe('network');
		expect(state.superheroes).toHaveLength(0);
	});

	it('fetchSuperheroById success sets selectedSuperhero; toggles loading', async () => {
		asMock(fetchSuperheroByIdAPI).mockResolvedValueOnce(heroA);

		const promise = useSuperhero.getState().fetchSuperheroById('1');
		expect(useSuperhero.getState().loading.details).toBe(true);
		await promise;

		expect(useSuperhero.getState().loading.details).toBe(false);
		expect(useSuperhero.getState().selectedSuperhero).toEqual(heroA);
		expect(useSuperhero.getState().error).toBeNull();
		expect(fetchSuperheroByIdAPI).toHaveBeenCalledWith('1');
	});

	it('fetchSuperheroById error sets error and clears selection', async () => {
		asMock(fetchSuperheroByIdAPI).mockRejectedValueOnce(new Error('not found'));

		useSuperhero.setState({ selectedSuperhero: heroB });
		await useSuperhero.getState().fetchSuperheroById('missing');

		expect(useSuperhero.getState().loading.details).toBe(false);
		expect(useSuperhero.getState().selectedSuperhero).toBeNull();
		expect(useSuperhero.getState().error).toBe('not found');
	});

	it('createSuperhero success returns hero and resets currentPage to 1; toggles loading', async () => {
		const dto: CreateSuperheroDto = {
			nickname: 'New', realName: 'Neo', originDescription: 'Matrix', superpowers: ['bullet-time'], catchPhrase: 'Whoa', images: ['http://img/new.png'],
		};
		asMock(createSuperheroAPI).mockResolvedValueOnce(heroA);

		useSuperhero.setState({ currentPage: 3 });
		const promise = useSuperhero.getState().createSuperhero(dto);
		expect(useSuperhero.getState().loading.create).toBe(true);
		const created = await promise;

		expect(created).toEqual(heroA);
		expect(useSuperhero.getState().currentPage).toBe(1);
		expect(useSuperhero.getState().loading.create).toBe(false);
		expect(useSuperhero.getState().error).toBeNull();
		expect(createSuperheroAPI).toHaveBeenCalled();
	});

	it('createSuperhero error sets error and returns undefined', async () => {
		asMock(createSuperheroAPI).mockRejectedValueOnce(new Error('bad input'));
		const created = await useSuperhero.getState().createSuperhero({} as unknown as CreateSuperheroDto);
		expect(created).toBeUndefined();
		expect(useSuperhero.getState().loading.create).toBe(false);
		expect(useSuperhero.getState().error).toBe('bad input');
	});

	it('updateSuperhero success updates list and selection; toggles loading', async () => {
		useSuperhero.setState({ superheroes: [heroA, heroB], selectedSuperhero: heroA });
		const updated: SuperheroWithImages = { ...heroA, nickname: 'Hero A2' };
		asMock(updateSuperheroAPI).mockResolvedValueOnce(updated as unknown as SuperheroWithImages & UpdateSuperheroDto);

		const promise = useSuperhero.getState().updateSuperhero('1', { nickname: 'Hero A2' });
		expect(useSuperhero.getState().loading.update).toBe(true);
		const result = await promise;

		expect(result).toEqual(updated);
		const state = useSuperhero.getState();
		expect(state.loading.update).toBe(false);
		expect(state.superheroes.find(h => h.id === '1')?.nickname).toBe('Hero A2');
		expect(state.selectedSuperhero?.nickname).toBe('Hero A2');
		expect(state.error).toBeNull();
		expect(updateSuperheroAPI).toHaveBeenCalledWith('1', { nickname: 'Hero A2' });
	});

	it('updateSuperhero error sets error and does not mutate heroes', async () => {
		useSuperhero.setState({ superheroes: [heroA], selectedSuperhero: heroA });
		asMock(updateSuperheroAPI).mockRejectedValueOnce(new Error('update failed'));

		await useSuperhero.getState().updateSuperhero('1', { nickname: 'X' });
		expect(useSuperhero.getState().error).toBe('update failed');
		expect(useSuperhero.getState().superheroes[0].nickname).toBe('Hero A');
		expect(useSuperhero.getState().selectedSuperhero?.nickname).toBe('Hero A');
		expect(useSuperhero.getState().loading.update).toBe(false);
	});

	it('deleteSuperhero toggles loading and calls API', async () => {
		asMock(deleteSuperheroAPI).mockResolvedValueOnce(undefined as unknown as any);

		const promise = useSuperhero.getState().deleteSuperhero('2');
		expect(useSuperhero.getState().loading.delete).toBe(true);
		await promise;

		expect(useSuperhero.getState().loading.delete).toBe(false);
		expect(useSuperhero.getState().error).toBeNull();
		expect(deleteSuperheroAPI).toHaveBeenCalledWith('2');
	});

	it('deleteSuperhero error sets error', async () => {
		asMock(deleteSuperheroAPI).mockRejectedValueOnce(new Error('delete failed'));
		await useSuperhero.getState().deleteSuperhero('2');
		expect(useSuperhero.getState().error).toBe('delete failed');
		expect(useSuperhero.getState().loading.delete).toBe(false);
	});

	it('setError updates error and clearSelectedSuperhero clears selection', () => {
		useSuperhero.setState({ selectedSuperhero: heroA });
		useSuperhero.getState().setError('boom');
		expect(useSuperhero.getState().error).toBe('boom');
		useSuperhero.getState().clearSelectedSuperhero();
		expect(useSuperhero.getState().selectedSuperhero).toBeNull();
	});

	it('uploadImage returns url and toggles loading; error sets error', async () => {
		const file = new File(['data'], 'a.png', { type: 'image/png' });
		asMock(uploadImageAPI).mockResolvedValueOnce({ url: 'http://img/upload.png' });

		const promise = useSuperhero.getState().uploadImage(file);
		expect(useSuperhero.getState().loading.upload).toBe(true);
		const url = await promise;

		expect(url).toBe('http://img/upload.png');
		expect(useSuperhero.getState().loading.upload).toBe(false);
		expect(useSuperhero.getState().error).toBeNull();

		asMock(uploadImageAPI).mockRejectedValueOnce(new Error('upload failed'));
		const url2 = await useSuperhero.getState().uploadImage(file);
		expect(url2).toBeUndefined();
		expect(useSuperhero.getState().error).toBe('upload failed');
	});
});
