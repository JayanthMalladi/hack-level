import express from 'express';
import { langflowHandler } from './src/api/langflow';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/langflow', langflowHandler);

export const handler = app; 