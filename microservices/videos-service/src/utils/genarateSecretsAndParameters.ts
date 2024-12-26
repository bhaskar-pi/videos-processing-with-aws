import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const secretName = 'aws-secs';

const SecClient = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const getAwsSecrets = async () => {
    try {
        const data = await SecClient.getSecretValue({ SecretId: secretName }).promise();
        return data.SecretString;
    } catch (err) {
        console.error('Error retrieving secret:', err);
        throw err;
    }
};


const parameterName = "BUCKET_NAME_AWS"

const ParaClient = new AWS.SSM({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});


export const getParameters = async () => {
    try {
        const data = await ParaClient.getParameter({
            Name: parameterName,
            WithDecryption: false
        }).promise();
        return data?.Parameter?.Value;
    } catch (err) {
        console.error('Error retrieving parameter:', err);
        throw err;
    }
};

