import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';
import { put } from '@vercel/blob';

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      await expect(service.uploadImage(undefined)).rejects.toThrow(
        new BadRequestException('No file uploaded'),
      );
    });

    it('should throw BadRequestException if the file is not an image', async () => {
      const nonImageFile = {
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      await expect(service.uploadImage(nonImageFile)).rejects.toThrow(
        new BadRequestException('Only image files are allowed'),
      );
    });

    it('should upload the file and return the URL', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockResponse = { url: 'https://blob.vercel.com/test.jpg' };
      (put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.uploadImage(mockFile);

      expect(put).toHaveBeenCalledWith(
        expect.stringContaining('test.jpg'),
        mockFile.buffer,
        {
          contentType: 'image/jpeg',
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        },
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
