import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

// Cache the JWKs
let jwksCache: any = null;

const getJWKs = async () => {
  if (jwksCache) {
    return jwksCache;
  }
  const response = await axios.get(`https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`);
  jwksCache = response.data.keys;
  return jwksCache;
};

const verifyCognitoToken = async (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Decode the token to get the header, including the kid (Key ID)
    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken || !decodedToken.header) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { kid } = decodedToken.header;

    // Retrieve the JWKs
    const jwks = await getJWKs();

    // Find the matching JWK
    const jwk = jwks.find((key: any) => key.kid === kid);

    if (!jwk) {
      return res.status(401).json({ message: 'Invalid token: Key not found' });
    }

    // Convert JWK to PEM format for verification
    const pem = jwkToPem(jwk);

    // Verify the token using the PEM
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Token is valid, store the decoded user data in request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

export default verifyCognitoToken;
