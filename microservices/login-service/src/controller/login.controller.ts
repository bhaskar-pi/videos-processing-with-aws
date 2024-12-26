import { Request, Response } from 'express';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { getAwsSecrets } from '../utils/generateAwsSecrets';
dotenv.config()

let awsSecrets :any;

const initializeAwsSecrets = async () => {
    try {
        awsSecrets = await getAwsSecrets();
        console.log('AWS Secrets initialized');
    } catch (err) {
        console.error('Failed to initialize AWS Secrets:', err);
        throw err;
    }
};

initializeAwsSecrets()

const AWS_COGNITO_CLIENT_ID = awsSecrets?.AWS_COGNITO_CLIENT_ID || process.env.AWS_COGNITO_CLIENT_ID


const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION
});

function parseIdToken(token: any) {
  const payload = token.split('.')[1];
  const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
  return decoded;
}


export const cognitoLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: AWS_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    const response = await cognito.initiateAuth(params).promise();
    const idToken = response.AuthenticationResult?.IdToken;

    const userAttributes = parseIdToken(idToken);

    const userEmail = userAttributes.email || null;
    const userName = userAttributes.name || null;
    
    res.status(200).json({
      message: 'Login successful',
      token: idToken,
      email: userEmail,
      userName: userName
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ message: 'Invalid email or password', error });
  }
};
