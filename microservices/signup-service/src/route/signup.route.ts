import express from 'express'
import { confirmSignUp, signUp } from '../controller/signup.controller';

const router = express.Router()

router.post('/signup', signUp);
router.post('/confirm-signup', confirmSignUp);

export default router