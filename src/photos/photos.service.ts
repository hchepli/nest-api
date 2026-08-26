import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PhotosService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPhotoDto: CreatePhotoDto) {
    try {
      return await this.prismaService.photo.create({ data: createPhotoDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma foto com esse nome');
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.photo.findMany();
  }

  async findOne(id: number) {
    const photo = await this.prismaService.photo.findUnique({
      where: { id },
    });
    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }
    return photo;
  }

  async update(id: number, updatePhotoDto: UpdatePhotoDto) {
    await this.findOne(id);
    try {
      return await this.prismaService.photo.update({ where: { id }, data: updatePhotoDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma foto com esse nome');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.photo.delete({ where: { id } });
  }
}
