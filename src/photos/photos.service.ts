// src/photos/photos.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { Prisma } from '../../generated/prisma/client';

// Interface local mínima, com só os campos que este service usa.
// Evita depender diretamente dos tipos do pacote @types/multer, que já
// mudou de formato entre versões e quebrou a compilação (Express.Multer.File
// sumiu, depois "File" nomeado também não bateu). O NestJS injeta em
// tempo de execução um objeto com esses campos (e outros) via multer;
// aqui só tipamos o que de fato lemos.
export interface UploadedFileLike {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size?: number;
}

interface CreatePhotoInput {
  albumId: number;
  isCover?: boolean;
}

@Injectable()
export class PhotosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(input: CreatePhotoInput, file: UploadedFileLike) {
    const url = await this.storageService.uploadFile(
      file.buffer,
      `albums/${input.albumId}`,
      file.originalname,
      file.mimetype,
    );

    try {
      return await this.prismaService.photo.create({
        data: {
          albumId: input.albumId,
          url,
          isCover: input.isCover ?? false,
        },
      });
    } catch (error) {
      // Se o registro no banco falhar (ex: albumId inexistente), desfaz o
      // upload já feito pra não deixar arquivo órfão no storage.
      await this.storageService.deleteFile(url).catch(() => undefined);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Álbum informado não existe.');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe uma foto com esse identificador.');
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.photo.findMany();
  }

  async findOne(id: number) {
    const photo = await this.prismaService.photo.findUnique({ where: { id } });
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
        throw new ConflictException('Já existe uma foto com esse identificador.');
      }
      throw error;
    }
  }

  // Dia 4: remoção de Photo também limpa o arquivo físico no storage.
  async remove(id: number) {
    const photo = await this.findOne(id);
    const deleted = await this.prismaService.photo.delete({ where: { id } });

    try {
      await this.storageService.deleteFile(photo.url);
    } catch (error) {
      // Não quebra a resposta da API se o arquivo já não existir mais no
      // storage por algum motivo — só loga (decisão já combinada no roadmap).
      console.error(`Falha ao remover arquivo do storage para Photo ${id}:`, error);
    }

    return deleted;
  }
}