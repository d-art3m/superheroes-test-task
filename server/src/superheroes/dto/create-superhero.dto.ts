import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateSuperheroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  realName: string;

  @IsString()
  @IsNotEmpty()
  originDescription: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  superpowers: string[];

  @IsString()
  @IsNotEmpty()
  catchPhrase: string;

  @IsArray()
  @IsOptional()
  @IsUrl(undefined, { each: true })
  images?: string[];
}
