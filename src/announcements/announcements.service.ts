import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, authorId: string) {
    const { slug, ...rest } = createAnnouncementDto;
    const finalSlug = slug ?? generateSlug(rest.title);

    try {
      return await this.prismaService.announcement.create({
        data: { ...rest, slug: finalSlug, authorId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um anúncio com esse nome');
      }
      throw error;
    }
  }

  // Uso público (site institucional) - só comunicados publicados
  findAll() {
    return this.prismaService.announcement.findMany({
      where: { status: 'PUBLISHED' },
    });
  }

  // Uso administrativo - todos os status, inclusive RASCUNHO (UC024/025)
  findAllAdmin() {
    return this.prismaService.announcement.findMany();
  }

  // Uso público - só retorna se estiver publicado (senão 404, não vaza rascunho por id)
  async findOne(id: number) {
    const announcement = await this.prismaService.announcement.findUnique({ where: { id } });
    if (!announcement || announcement.status !== 'PUBLISHED') {
      throw new NotFoundException('Anúncio não encontrado');
    }
    return announcement;
  }

  // Uso administrativo - encontra independente do status
  async findOneAdmin(id: number) {
    const announcement = await this.prismaService.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Anúncio não encontrado');
    }
    return announcement;
  }

  async update(id: number, updateAnnouncementDto: UpdateAnnouncementDto) {
    await this.findOneAdmin(id);
    try {
      return await this.prismaService.announcement.update({ where: { id }, data: updateAnnouncementDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um anúncio com esse nome');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOneAdmin(id);
    return await this.prismaService.announcement.delete({ where: { id } });
  }
}