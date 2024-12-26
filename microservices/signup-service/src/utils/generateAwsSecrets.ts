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