import { S3 } from 'aws-sdk';
import { config } from 'dotenv';

config();

export const awsS3 = new S3({
  accessKeyId: process.env.ACCESS_ID,
  secretAccessKey: process.env.ACCESS_SECRET_KEY,
  region: process.env.AWS_BUCKET_REGION,
});
