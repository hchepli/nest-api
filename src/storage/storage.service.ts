// src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { StorageProvider } from './storage-provider.interface';
import { R2StorageProvider } from './providers/r2-storage.provider';
import { CloudinaryStorageProvider } from './providers/cloudinary-storage.provider';

// RNF009 - otimização de imagem no backend antes do upload.
// Redimensiona (só encolhe, nunca aumenta) e comprime, mantendo o formato
// original. Valores abaixo são um ponto de partida razoável, não uma
// decisão travada em pedra - ajustar se algum álbum precisar de mais
// qualidade (ex: fotos de capa em destaque).
const MAX_WIDTH_PX = 1920;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const WEBP_QUALITY = 80;

@Injectable()
export class StorageService {
  private readonly provider: StorageProvider;

  constructor() {
    // Troca de provider é só isso: mudar STORAGE_PROVIDER no .env.
    // Nenhum outro módulo do sistema precisa saber qual está ativo.
    const providerName = (process.env.STORAGE_PROVIDER ?? 'r2').toLowerCase();

    switch (providerName) {
      case 'r2':
        this.provider = new R2StorageProvider();
        break;
      case 'cloudinary':
        this.provider = new CloudinaryStorageProvider();
        break;
      default:
        throw new Error(
          `STORAGE_PROVIDER="${providerName}" inválido. Use "r2" ou "cloudinary".`,
        );
    }
  }

  /**
   * Faz upload de um arquivo (com otimização prévia, se for imagem) e
   * retorna a URL pública final.
   * @param buffer            Conteúdo do arquivo (memoryStorage do multer)
   * @param folder            Pasta lógica, ex: `albums/${albumId}`
   * @param originalFilename  Nome original do arquivo (só para referência na key, sanitizado)
   * @param mimetype          Content-Type do arquivo
   */
  async uploadFile(
    buffer: Buffer,
    folder: string,
    originalFilename: string,
    mimetype: string,
  ): Promise<string> {
    const optimizedBuffer = await this.optimizeImage(buffer, mimetype);
    const sanitized = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${randomUUID()}-${sanitized}`;
    return this.provider.upload(optimizedBuffer, key, mimetype);
  }

  /**
   * Remove um arquivo do storage a partir da URL salva no banco (ex: Photo.url).
   */
  async deleteFile(url: string): Promise<void> {
    await this.provider.deleteByUrl(url);
  }

  /**
   * Redimensiona (só encolhe) e comprime a imagem antes do upload (RNF009).
   * Se a otimização falhar por qualquer motivo, envia o arquivo original
   * em vez de bloquear o upload inteiro.
   */
  private async optimizeImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    try {
      let pipeline = sharp(buffer).resize({
        width: MAX_WIDTH_PX,
        withoutEnlargement: true, // nunca aumenta foto menor que o limite
      });

      switch (mimetype) {
        case 'image/jpeg':
          pipeline = pipeline.jpeg({ quality: JPEG_QUALITY });
          break;
        case 'image/png':
          pipeline = pipeline.png({ quality: PNG_QUALITY });
          break;
        case 'image/webp':
          pipeline = pipeline.webp({ quality: WEBP_QUALITY });
          break;
        default:
          // Tipo não esperado (não deveria chegar aqui, já filtrado no
          // controller) - devolve sem otimizar.
          return buffer;
      }

      return await pipeline.toBuffer();
    } catch (error) {
      console.error('Falha ao otimizar imagem, enviando arquivo original:', error);
      return buffer;
    }
  }
}