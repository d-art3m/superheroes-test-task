import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SuperheroesService } from './superheroes.service';
import { CreateSuperheroDto } from './dto/create-superhero.dto';
import { UpdateSuperheroDto } from './dto/update-superhero.dto';
import { PaginationDto } from 'src/types/pagination';

@Controller('superheroes')
export class SuperheroesController {
  constructor(private readonly heroes: SuperheroesService) {}

  @Post()
  create(@Body() dto: CreateSuperheroDto) {
    return this.heroes.create(dto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.heroes.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.heroes.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSuperheroDto) {
    return this.heroes.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.heroes.remove(id);
  }
}
