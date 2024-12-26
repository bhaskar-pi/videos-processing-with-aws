import { Response } from "express";
import { upload } from "../utils/upload";
// import { updateResolution } from "../utils/ffmpegHelper";
import AWS from 'aws-sdk';
import { v4 as uuidV4 } from 'uuid';
import dotenv from 'dotenv'
import fs from 'fs'
import { generatePreSignedUrls } from "../utils/generatePresignedUrls";
import { getAwsSecrets, getParameters } from "../utils/genarateSecretsAndParameters";
import { publishEvent } from "../eventservice/s3EventService";

dotenv.config()

let awsSecrets :any;
let awsParameters: any

const initializeAwsSecretsAndParameters = async () => {
    try {
        awsSecrets = await getAwsSecrets();
        console.log('AWS Secrets initialized');
        awsParameters = await getParameters()
        console.log('AWS Parameters initialized');
    } catch (err) {
        console.error('Failed to initialize AWS Secrets:', err);
        throw err;
    }
};

initializeAwsSecretsAndParameters()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION
});

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // sessionToken: process.env.AWS_SESSION_TOKEN
});

const BUCKET_NAME = awsParameters || process.env.AWS_BUCKET_NAME;

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoClient = new AWS.DynamoDB();

const tableName = awsSecrets?.DYNAMODB_TABLE_NAME;
const sortKey = "name"; //sk

export const createTableIfNotExists = async (tableName: string) => {
  try {
    await dynamoClient.describeTable({ TableName: tableName }).promise();
    console.log(`Table ${tableName} exists`);
  } catch (error: any) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`Table ${tableName} does not exist, creating table...`);

      const params = {
        TableName: tableName,
        AttributeDefinitions: [
          {
            AttributeName: "qut-username", //pk
            AttributeType: "S",
          },
          {
            AttributeName: sortKey, //sk
            AttributeType: "S", 
          },
      ],
      KeySchema: [
          {
            AttributeName: "qut-username",
            KeyType: "HASH",
          },
          {
            AttributeName: sortKey,
            KeyType: "RANGE",
          },
      ],
      ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
      },
      };

      // Create the table
      await dynamoClient.createTable(params).promise();
      console.log('Table created successfully');

      // Wait until the table is ACTIVE
      await dynamoClient.waitFor('tableExists', { TableName: tableName }).promise();
      console.log(`Table ${tableName} is now active`);
    } else {
      throw error;
    }
  }
};

const uploadVideo = async (request: any, response: Response) => {
  console.log('Request body:', request.body);
  console.log('user', request.user);

  const file = request.file;
  
  try {
    if (file) {
      await createTableIfNotExists(tableName)
      console.log({file, BUCKET_NAME})
      const params = {
        Bucket: BUCKET_NAME,
        Key: `${file.originalname}`,
        Body: fs.createReadStream(file.path), 
        ContentType: file.mimetype,
      };

      console.log({params})

      const uploadResult = await s3.upload(params).promise();

      console.log({uploadResult})
      
      // Save metadata to DynamoDB
      const videoMetadata = {
        'qut-username':`n11464453@qut.edu.au`,
        'name': `videos_${request.user.email}_${file.originalname}`,
        videoId: `${file.originalname}_${uuidV4()}`,
        fileName: file.originalname,
        title: request.body.title,
        description: request.body.description,
        uploadedBy: request.user.id,
        userEmail: request.user.email,
        uploadDate: new Date().toISOString(),
        s3Url: uploadResult.Location
      };

      const dynamoParams = {
        TableName: tableName, 
        Item: videoMetadata
      };

      console.log({dynamoParams})

      await dynamoDB.put(dynamoParams).promise();

      response.status(200).json({ message: 'Video uploaded successfully', file: uploadResult.Location });
    } else {
      response.status(400).json({ message: 'No video file uploaded' });
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    response.status(500).json({ message: 'Server error', error });
  }
};

export const getAllVideos = async (req: any, res: Response) => {
  const user = req.user;
  const userEmail = user.email;

  const queryParams = {
    TableName: tableName,
    KeyConditionExpression: '#pk = :pkValue and begins_with(#sk, :skValue)',  
    ExpressionAttributeNames: {
      '#pk': 'qut-username', // This should be the attribute name for the primary key
      '#sk': 'name' // This should be the attribute name for the sort key
    },
    ExpressionAttributeValues: {
      ':pkValue': "n11464453@qut.edu.au", // This should be the value you want to match for the primary key
      ':skValue': `videos_${userEmail}` // This should be the value you want the sort key to start with
    }
  };
  console.log({queryParams})

  try {
    const result = await dynamoDB.query(queryParams).promise();
    const videos = result.Items || [];

    const preSignedUrls: any = {};

    for (const video of videos) {
      const urls = await generatePreSignedUrls(video.fileName);
      preSignedUrls[video.fileName] = urls;
    }

    console.log({ videos, preSignedUrls });

    res.status(200).json({ videos, preSignedUrls });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error });
  }
};

export const deleteVideo = async(req: any, res: any) => {
  try {
    const {fileName, userEmail} = req.body

    console.log({fileName, userEmail})
    const queryParams = {
      TableName: tableName,
      Key: {
        'qut-username': "n11464453@qut.edu.au",
        'name': `videos_${userEmail}_${fileName}` 
      }
    };

    console.log({queryParams})

     const result = await dynamoDB.delete(queryParams).promise()
     console.log({result})

     await publishEvent({fileName, event: 'DELETE-VIDEO-FROM-S3', bucketName: BUCKET_NAME})
     res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error in deleting video.' });
  }
}

export default [
  upload.single('video'),
  uploadVideo
];
