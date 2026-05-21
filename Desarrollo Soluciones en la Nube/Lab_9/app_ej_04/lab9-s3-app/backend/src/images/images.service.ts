import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import {
  ALLOWED_CONTENT_TYPES,
  CreateUploadUrlDto,
  MAX_FILE_SIZE_BYTES,
} from './dto/create-upload-url.dto';

// Prefijo bajo el cual se guardan todas las imágenes originales en el bucket.
const KEY_PREFIX = 'originales/';

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface ImageItem {
  key: string;
  size: number;
  lastModified: string | null;
  url: string;
}

@Injectable()
export class ImagesService implements OnModuleInit {
  private readonly logger = new Logger(ImagesService.name);
  private s3!: S3Client;
  private bucket!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    // Instanciamos un único S3Client reutilizable durante el ciclo de vida del módulo.
    const region = this.config.get<string>('AWS_REGION');
    const bucket = this.config.get<string>('S3_BUCKET');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Faltan variables de entorno: AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY',
      );
    }

    this.bucket = bucket;
    this.s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      // Evita que el SDK firme un checksum CRC32 que el navegador no envía en el PUT.
      // Sin esto, las presigned URLs fallan con SignatureDoesNotMatch al subir desde el browser.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  // Genera una URL presignada PUT para que el navegador suba directo a S3.
  // El bucket permanece privado; sólo este URL temporal autoriza la escritura.
  async generateUploadUrl(dto: CreateUploadUrlDto): Promise<UploadUrlResponse> {
    // Doble validación: aunque el DTO ya valida, repetimos por defensa en profundidad.
    if (!ALLOWED_CONTENT_TYPES.includes(dto.contentType)) {
      throw new BadRequestException(
        `Tipo no permitido. Solo se aceptan: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
      );
    }
    if (dto.sizeBytes <= 0 || dto.sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('El archivo excede el tamaño máximo permitido (5 MB).');
    }

    // Sanitizamos el nombre original para evitar caracteres raros o path traversal (../).
    const safeName = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Generamos una key única para evitar colisiones al subir archivos con el mismo nombre.
    const key = `${KEY_PREFIX}${Date.now()}-${randomBytes(6).toString('hex')}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
      ServerSideEncryption: 'AES256',
    });

    try {
      // La URL expira en 5 minutos: tiempo suficiente para subir, no tanto como para reusarse.
      const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
      return { uploadUrl, key };
    } catch (err) {
      this.logger.error('Error generando upload URL', err as Error);
      throw new InternalServerErrorException('No se pudo generar el enlace de subida.');
    }
  }

  // Lista los objetos bajo el prefijo originales/ y genera presigned GET para cada uno.
  async listImages(): Promise<ImageItem[]> {
    try {
      const result = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: KEY_PREFIX }),
      );

      const contents = result.Contents ?? [];
      // Filtramos el propio "directorio" si apareciera como key vacía.
      const objects = contents.filter((obj) => obj.Key && obj.Key !== KEY_PREFIX);

      const items: ImageItem[] = await Promise.all(
        objects.map(async (obj) => {
          // URL temporal de lectura (15 minutos) — permite mostrar la imagen sin exponer el bucket.
          const url = await getSignedUrl(
            this.s3,
            new GetObjectCommand({ Bucket: this.bucket, Key: obj.Key! }),
            { expiresIn: 900 },
          );
          return {
            key: obj.Key!,
            size: obj.Size ?? 0,
            lastModified: obj.LastModified ? obj.LastModified.toISOString() : null,
            url,
          };
        }),
      );

      // Más recientes primero.
      items.sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''));
      return items;
    } catch (err) {
      this.logger.error('Error listando imágenes', err as Error);
      throw new InternalServerErrorException('No se pudieron obtener las imágenes.');
    }
  }

  // Elimina un objeto, asegurándose primero de que la key viva bajo el prefijo permitido.
  async deleteImage(key: string): Promise<{ deleted: true; key: string }> {
    if (!key || !key.startsWith(KEY_PREFIX)) {
      throw new BadRequestException('Key inválida.');
    }
    // Defensa extra contra path traversal.
    if (key.includes('..')) {
      throw new BadRequestException('Key inválida.');
    }

    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return { deleted: true, key };
    } catch (err) {
      this.logger.error(`Error eliminando ${key}`, err as Error);
      throw new InternalServerErrorException('No se pudo eliminar la imagen.');
    }
  }
}
