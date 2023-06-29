import { Injectable } from '@nestjs/common';
import { awsS3 } from './aws.config';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import S3 from 'aws-sdk/clients/s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileUploaderService {
  async uploadFile(file: Express.Multer.File) {
    const uniqueKey = `${Date.now()}-${uuid()}`;
    const uploadParams: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueKey,
      Body: file.buffer,
      //ACL: 'public-read',
    };

    const result: ManagedUpload.SendData = await awsS3
      .upload(uploadParams)
      .promise();
    return result.Location;
  }
}
