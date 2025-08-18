import { Injectable, NotFoundException } from '@nestjs/common';
import { Superhero } from '@prisma/client';
import { CreateSuperheroDto } from './dto/create-superhero.dto';
import { UpdateSuperheroDto } from './dto/update-superhero.dto';
import { PaginationDto, PaginatedResult } from 'src/types/pagination';
import { SuperheroWithImages } from 'src/types/superhero';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuperheroesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSuperheroDto): Promise<Superhero> {
    const { images = [], ...hero } = dto;
    return this.prisma.superhero.create({
      data: {
        ...hero,
        images: { createMany: { data: images.map((url) => ({ url })) } },
      },
      include: { images: true },
    });
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<SuperheroWithImages>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 5;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.superhero.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          images: { take: 1, orderBy: { id: 'desc' }, select: { url: true } },
        },
      }),
      this.prisma.superhero.count(),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<SuperheroWithImages> {
    const hero = await this.prisma.superhero.findUnique({
      where: { id },
      include: { images: { orderBy: { id: 'desc' }, select: { url: true } } },
    });
    if (!hero) throw new NotFoundException('Superhero not found');
    return hero;
  }

  async update(
    id: string,
    dto: UpdateSuperheroDto,
  ): Promise<SuperheroWithImages> {
    const existing = await this.prisma.superhero.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) throw new NotFoundException('Superhero not found');

    const { images, ...data } = dto;

    const operations = [];

    if (images) {
      const currentUrls = existing.images.map((img) => img.url);
      const toAdd = images.filter((url) => !currentUrls.includes(url));
      const toRemove = existing.images.filter(
        (img) => !images.includes(img.url),
      );

      if (toRemove.length) {
        operations.push(
          this.prisma.heroImage.deleteMany({
            where: { id: { in: toRemove.map((img) => img.id) } },
          }),
        );
      }

      if (toAdd.length) {
        operations.push(
          ...toAdd.map((url) =>
            this.prisma.heroImage.create({
              data: { url, superheroId: id },
            }),
          ),
        );
      }
    }

    operations.push(
      this.prisma.superhero.update({
        where: { id },
        data,
      }),
    );

    await this.prisma.$transaction(operations);

    return this.findOne(id);
  }

  async remove(id: string): Promise<Superhero> {
    const existing = await this.prisma.superhero.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Superhero not found');

    return await this.prisma.superhero.delete({ where: { id } });
  }
}
