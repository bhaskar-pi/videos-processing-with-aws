import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import resolutionRouter from './route/resolution.route'

dotenv.config()

const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

app.use('/api/videos', resolutionRouter)

app.get('/api/resolution-service', (req:any, res:any) => {
  res.json({ message: 'Hey, I am resolution service,  working!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});