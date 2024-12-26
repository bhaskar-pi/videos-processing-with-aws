import express from 'express'
import uploadVideo, { deleteVideo, getAllVideos } from '../controller/videos.controller'
import verifyCognitoToken from '../middlewares'

const router = express.Router()

router.post('/upload', verifyCognitoToken, uploadVideo)

router.get('/all', verifyCognitoToken, getAllVideos)

router.delete('/delete', verifyCognitoToken, deleteVideo)

export default router   