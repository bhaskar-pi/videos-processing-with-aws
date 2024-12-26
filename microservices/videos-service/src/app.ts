import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import videoRouter from './route/videos.route'
import path from 'path'
import fs from 'fs'

dotenv.config()

const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

app.use('/api/videos', videoRouter)

app.get('/api/videos-service', (req:any, res:any) => {
  res.json({ message: 'Hey, I am videos-service, working!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});