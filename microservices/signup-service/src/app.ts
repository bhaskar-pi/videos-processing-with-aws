import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import SignupRouter from './route/signup.route'

dotenv.config()

const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use('/api', SignupRouter)

/*
    To test login service api working or not
*/
app.get('/api/signup-service', (req:any, res:any) => {
  res.json({ message: 'Hey, I am signup service, working!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});