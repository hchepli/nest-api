// src/photos/photos.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import type { UploadedFileLike } from './photos.service';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit-logs/decorators/auditable.decorator';

// RNF008 - valores sugeridos, ainda não confirmados definitivamente.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiBearerAuth()
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Auditable('Photo')
  @Roles('Admin Geral', 'Secretaria')
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['albumId', 'file'],
      properties: {
        albumId: { type: 'integer', example: 1 },
        isCover: { type: 'boolean', example: false },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `Tipo de arquivo não permitido: ${file.mimetype}. Use JPEG, PNG ou WEBP.`,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  create(
    @UploadedFile() file: UploadedFileLike,
    @Body('albumId', ParseIntPipe) albumId: number,
    @Body('isCover') isCover?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo (file) é obrigatório.');
    }
    return this.photosService.create(
      { albumId, isCover: isCover === 'true' },
      file,
    );
  }

  @Public()
  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.photosService.findOne(id);
  }

  // Atualização (ex: marcar/desmarcar capa) continua via JSON comum,
  // não envolve reenvio de arquivo.
  @Auditable('Photo')
  @Roles('Admin Geral', 'Secretaria')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.photosService.update(id, updatePhotoDto);
  }

  @Auditable('Photo')
  @Roles('Admin Geral', 'Secretaria')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.photosService.remove(id);
  }
}