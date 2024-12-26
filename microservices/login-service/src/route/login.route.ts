import express from 'express'
import { cognitoLogin } from '../controller/login.controller'

const router = express.Router()

router.post('/login', cognitoLogin);

export default router