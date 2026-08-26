import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class AlbumsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto) {
    const { slug, ...rest } = createAlbumDto;
    const finalSlug = slug ?? generateSlug(rest.title);

    try {
      return await this.prismaService.album.create({
        data: { ...rest, slug: finalSlug },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um álbum com esse nome');
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.album.findMany();
  }

  async findOne(id: number) {
    const album = await this.prismaService.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException('Álbum não encontrado');
    }
    return album;
  }

  async update(id: number, updateAlbumDto: UpdateAlbumDto) {
    await this.findOne(id);
    return await this.prismaService.album.update({ where: { id }, data: updateAlbumDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.album.delete({ where: { id } });
  }
}