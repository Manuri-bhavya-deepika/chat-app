import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToDb from './config/mongodb';
import mainRouter from './controllers/mainController';
dotenv.config();

const app= express();

app.use(cors());
app.use(express.json());

connectToDb();

app.use('/api/v1',mainRouter);


const PORT = process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})