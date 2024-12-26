import express from 'express'
import {handleResolutionUpdate } from '../controller/resolution.controller'
import verifyToken from '../middlewares'

const router = express.Router()

router.post('/update-resolution', verifyToken, handleResolutionUpdate);

export default router