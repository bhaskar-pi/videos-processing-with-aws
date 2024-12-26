import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import LoginRouter from './route/login.route'

dotenv.config()

const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use('/api', LoginRouter)



/*
    To test login service api working or not
*/
app.get('/api/login-service', (req:any, res:any) => {
  res.json({ message: 'Hey, I am login service, working!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});