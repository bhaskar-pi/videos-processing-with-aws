import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs-extra';
import AWS from 'aws-sdk';
import dotenv from "dotenv"
dotenv.config()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

const resolutions: { [key: string]: string } = {
  '360p': '640x360',
  '480p': '854x480',
  '720p': '1280x720',
  '1080p': '1920x1080',
};

const ensureTempDirectoryExists = () => {
  const tempDir = path.join(__dirname, '../../temp');

  console.log({ tempDir });
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
};

const getVideoFromS3 = async (bucketName: string, key: string, downloadPath: string): Promise<void> => {
  const params = { Bucket: bucketName, Key: key };
  const fileStream = fs.createWriteStream(downloadPath);

  console.log(`Downloading video from S3: ${key} to ${downloadPath}`);

  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .on('error', (err) => {
        console.error(`Error downloading video from S3: ${err.message}`);
        reject(err);
      })
      .pipe(fileStream)
      .on('close', () => {
        console.log(`Video successfully downloaded to ${downloadPath}`);
        resolve();
      });
  });
};

const uploadVideoToS3 = async (bucketName: string, key: string, filePath: string): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fs.createReadStream(filePath), 
    ContentType: 'video/mp4', 
  };

  const uploadResult = await s3.upload(params).promise();
  console.log({ uploadResult });
  return uploadResult.Location; 
};

export const updateResolution = async (fileName: string, resolution: string): Promise<{ url: string }> => {
  const bucketName = process.env.AWS_BUCKET_NAME || ""; 
  const originalKey = `${fileName}`; 
  const outputResolution = resolutions[resolution];

  if (!outputResolution) {
    throw new Error('Invalid resolution');
  }

  ensureTempDirectoryExists();

  const downloadPath = path.join(__dirname, '../../temp', fileName);
  const fileNameWithoutExt = path.parse(fileName).name;
  const fileExtension = path.extname(fileName);
  const outputFileName = `${fileNameWithoutExt}_${resolution}${fileExtension}`;
  const outputPath = path.join(__dirname, '../../temp', outputFileName);
  const newS3Key = `${outputFileName}`; // Key for the output video in S3

  // try {
  //   await s3.headObject({ Bucket: bucketName, Key: newS3Key }).promise();
  //   const s3Url = `https://${bucketName}.s3.amazonaws.com/${newS3Key}`;
  //   console.log(`File already exists in S3: ${s3Url}`);
  //   return { url: s3Url };
  // } catch (error: any) {
  //   if (error.code !== 'NotFound') {
  //     throw new Error(`Error checking for existing video: ${error.message}`);
  //   }
  //   console.log(`File does not exist in S3, proceeding with conversion.`);
  // }

  await getVideoFromS3(bucketName, originalKey, downloadPath);

  return new Promise((resolve, reject) => {
    ffmpeg(downloadPath)
      .size(outputResolution)
      .output(outputPath)
      .on('end', async () => {
        console.log(`Video conversion finished: ${outputPath}`);
        
        const s3Url = await uploadVideoToS3(bucketName, newS3Key, outputPath);

        fs.unlinkSync(downloadPath);
        fs.unlinkSync(outputPath);

        resolve({ url: s3Url });
      })
      .on('error', (err) => {
        console.error(`Error during video conversion: ${err.message}`);
        reject(new Error('Failed to convert video'));
      })
      .run();
  });
};
