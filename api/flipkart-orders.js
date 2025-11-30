// Vercel Serverless Function for Flipkart Orders
import axios from 'axios';

// Flipkart API Base URL
const FLIPKART_API_BASE = 'https://api.flipkart.net/sellers';

// Generate Flipkart OAuth Token
async function getFlipkartToken(appId, appSecret) {
    try {
        const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');

        const response = await axios.post(
            `${FLIPKART_API_BASE}/oauth/token`,
            'grant_type=client_credentials&scope=Seller_Api',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Flipkart Token Error:', error.response?.data || error.message);
        throw new Error('Failed to get Flipkart access token');
    }
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { credentials, startDate, endDate } = req.body;

        // Use environment variables if available, otherwise use credentials from request
        const appId = process.env.VITE_FLIPKART_APP_ID || credentials?.appId;
        const appSecret = process.env.VITE_FLIPKART_APP_SECRET || credentials?.appSecret;

        if (!appId || !appSecret) {
            return res.status(400).json({ error: 'Missing Flipkart credentials (appId, appSecret)' });
        }

        // Get access token
        const accessToken = await getFlipkartToken(appId, appSecret);

        // Fetch orders from Flipkart
        const filter = {
            states: ['Approved', 'Packed', 'Ready to Dispatch', 'Shipped', 'Delivered'],
            orderDate: {
                fromDate: new Date(startDate).toISOString(),
                toDate: new Date(endDate).toISOString()
            }
        };

        const ordersResponse = await axios.post(
            `${FLIPKART_API_BASE}/orders/search`,
            { filter },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const orders = ordersResponse.data.orderItems || [];

        res.status(200).json({
            success: true,
            orders: orders,
            count: orders.length
        });

    } catch (error) {
        console.error('Flipkart API Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to fetch Flipkart orders',
            details: error.response?.data || error.message
        });
    }
}
