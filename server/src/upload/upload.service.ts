import { BadRequestException, Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  async uploadImage(file?: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const path = `${Date.now()}_${file.originalname}`;

    const { url } = await put(path, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return { url };
  }
}
