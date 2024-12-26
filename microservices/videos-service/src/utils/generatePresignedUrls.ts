import AWS from 'aws-sdk';
import dotenv from 'dotenv'

dotenv.config()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

export const generatePreSignedUrls = async (fileName: string, expiresIn = 60 * 60 * 24) => {
  const resolutions = ['360p', '480p', '720p', '1080p'];

  const urls: any = {};

  const fileBaseName = fileName.substring(0, fileName.lastIndexOf('.')); 
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')); 

  for (const resolution of resolutions) {
    const outputFileName = `${fileBaseName}_${resolution}${fileExtension}`;

    try {
      await s3.headObject({ Bucket: BUCKET_NAME, Key: outputFileName }).promise();

      const preSignedUrl = await s3.getSignedUrl('getObject', {
        Bucket: BUCKET_NAME,
        Key: outputFileName,
        Expires: expiresIn,
      });

      urls[resolution] = preSignedUrl;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        // File doesn't exist, handle the case here (e.g., skip this resolution or log the error)
        console.warn(`File ${outputFileName} not found in S3.`)
      } else {
        // Some other error occurred (e.g., permission issues)
        // throw new Error(`Error checking or generating pre-signed URL for ${outputFileName}: ${error.message}`);
      }
    }
  }

  return urls;
};
