import { IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export class CreateUploadUrlDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  filename!: string;

  @IsIn(ALLOWED_CONTENT_TYPES as unknown as string[])
  contentType!: (typeof ALLOWED_CONTENT_TYPES)[number];

  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  sizeBytes!: number;
}
