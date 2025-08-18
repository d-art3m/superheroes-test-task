import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSuperheroDto } from './dto/create-superhero.dto';
import { UpdateSuperheroDto } from './dto/update-superhero.dto';
import { SuperheroesService } from './superheroes.service';

const mockPrismaService = {
  superhero: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  heroImage: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (operations) => {
    return Promise.all(operations);
  }),
};

const superman = {
  id: 'superman-id',
  nickname: 'Superman',
  realName: 'Clark Kent',
  originDescription: 'He came from Krypton.',
  superpowers: ['Flight', 'Super Strength'],
  catchPhrase: 'Up, up and away!',
  images: [{ id: 'img-1', url: 'http://example.com/superman.jpg' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SuperheroesService', () => {
  let service: SuperheroesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperheroesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SuperheroesService>(SuperheroesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a superhero with images', async () => {
      const dto: CreateSuperheroDto = {
        nickname: 'Superman',
        realName: 'Clark Kent',
        originDescription: 'He came from Krypton.',
        superpowers: ['Flight', 'Super Strength'],
        catchPhrase: 'Up, up and away!',
        images: ['http://example.com/superman.jpg'],
      };

      prisma.superhero.create.mockResolvedValue(superman);

      const result = await service.create(dto);

      expect(prisma.superhero.create).toHaveBeenCalledWith({
        data: {
          nickname: dto.nickname,
          realName: dto.realName,
          originDescription: dto.originDescription,
          superpowers: dto.superpowers,
          catchPhrase: dto.catchPhrase,
          images: {
            createMany: {
              data: [{ url: 'http://example.com/superman.jpg' }],
            },
          },
        },
        include: { images: true },
      });
      expect(result).toEqual(superman);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of superheroes', async () => {
      const heroes = [superman];
      const total = 1;

      prisma.superhero.findMany.mockResolvedValue(heroes);
      prisma.superhero.count.mockResolvedValue(total);

      prisma.$transaction.mockResolvedValue([heroes, total]);

      const paginationDto = { page: 1, limit: 5 };
      const result = await service.findAll(paginationDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.superhero.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          images: { take: 1, orderBy: { id: 'desc' }, select: { url: true } },
        },
      });
      expect(prisma.superhero.count).toHaveBeenCalled();
      expect(result).toEqual({ items: heroes, total });
    });
  });

  describe('findOne', () => {
    it('should return a single superhero if found', async () => {
      prisma.superhero.findUnique.mockResolvedValue(superman);
      const result = await service.findOne(superman.id);
      expect(prisma.superhero.findUnique).toHaveBeenCalledWith({
        where: { id: superman.id },
        include: { images: { orderBy: { id: 'desc' }, select: { url: true } } },
      });
      expect(result).toEqual(superman);
    });

    it('should throw NotFoundException if superhero is not found', async () => {
      prisma.superhero.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if superhero to update is not found', async () => {
      prisma.superhero.findUnique.mockResolvedValue(null);
      const dto: UpdateSuperheroDto = { nickname: 'Superboy' };
      await expect(service.update('non-existent-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update a superhero and handle image changes', async () => {
      const existingHero = { ...superman };
      const dto: UpdateSuperheroDto = {
        nickname: 'Superman Prime',
        images: [
          'http://example.com/superman.jpg',
          'http://example.com/new.jpg',
        ],
      };
      const imageToRemove = {
        id: 'img-to-remove',
        url: 'http://example.com/old.jpg',
      };
      existingHero.images = [
        { id: 'img-1', url: 'http://example.com/superman.jpg' },
        imageToRemove,
      ];
      const updatedHero = { ...superman, nickname: 'Superman Prime' };

      prisma.superhero.findUnique
        .mockResolvedValueOnce(existingHero)
        .mockResolvedValueOnce(updatedHero);

      prisma.superhero.update.mockResolvedValue(updatedHero);

      const result = await service.update(superman.id, dto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.heroImage.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [imageToRemove.id] } },
      });

      expect(prisma.heroImage.create).toHaveBeenCalledWith({
        data: { url: 'http://example.com/new.jpg', superheroId: superman.id },
      });

      expect(prisma.superhero.update).toHaveBeenCalledWith({
        where: { id: superman.id },
        data: { nickname: 'Superman Prime' },
      });

      expect(result).toEqual(updatedHero);
    });
  });

  describe('remove', () => {
    it('should remove a superhero', async () => {
      prisma.superhero.findUnique.mockResolvedValue(superman);
      prisma.superhero.delete.mockResolvedValue(superman);

      const result = await service.remove(superman.id);

      expect(prisma.superhero.findUnique).toHaveBeenCalledWith({
        where: { id: superman.id },
      });
      expect(prisma.superhero.delete).toHaveBeenCalledWith({
        where: { id: superman.id },
      });
      expect(result).toEqual(superman);
    });

    it('should throw NotFoundException if superhero to remove is not found', async () => {
      prisma.superhero.findUnique.mockResolvedValue(null);
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
