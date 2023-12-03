import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { UserRouter } from './routes/userRoutes.js'
const {MONGO_URL} = process.env

const app = express()
app.use(express.json())
app.use(cors())
app.use('/api'  ,UserRouter)

mongoose.connect(MONGO_URL)

app.listen(3000, () => {
    console.log('Server running on port 3000')
})