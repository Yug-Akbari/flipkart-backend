// Development server to test Vercel serverless functions locally
import express from 'express';
import cors from 'cors';
import flipkartOrdersHandler from './api/flipkart-orders.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Wrap Vercel handler for Express
app.all('/api/flipkart-orders', async (req, res) => {
    await flipkartOrdersHandler(req, res);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Dev server running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Dev server running on http://localhost:${PORT}`);
    console.log(`📦 API endpoint: http://localhost:${PORT}/api/flipkart-orders`);
});
