import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { getAwsSecrets } from '../utils/generateAwsSecrets';

dotenv.config();

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION
});


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

export const signUp = async (req: any, res: any) => {
    const { email, name, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const params = {
        ClientId: AWS_COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'name',
            Value: name
          }
        ]
      };
  
      const data = await cognito.signUp(params).promise();
      res.status(200).json({email, message: 'User signed up successfully, please confirm your email.', data });
  
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ message: 'Error signing up', error });
    }
};
  
export const confirmSignUp = async (req: any, res: any) => {
    const { email, code } = req.body;

    try {
      const params = {
        ClientId: AWS_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code
      };
  
      await cognito.confirmSignUp(params).promise();
      res.status(200).json({ message: 'User confirmed successfully' });
  
    } catch (error) {
      console.error('Error confirming sign up:', error);
      res.status(500).json({ message: 'Error confirming sign up', error });
    }
  };
  