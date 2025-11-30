// Flipkart Seller API Integration via Backend Server
// Set USE_MOCK_DATA to false when your backend is running

const USE_MOCK_DATA = false; // Change to false to use real Flipkart API

export async function fetchFlipkartOrders(credentials, startDate, endDate) {
    // Mock data for testing without backend
    if (USE_MOCK_DATA) {
        console.log('Using mock Flipkart data for testing');
        return getMockOrders(startDate, endDate);
    }

    // Real implementation - calls serverless function
    // In production, this will be /api/flipkart-orders
    // In development with Vite, we need to proxy or use full URL
    const apiUrl = '/api/flipkart-orders';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credentials,
                startDate,
                endDate
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to fetch orders from Flipkart');
        }

        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error('Flipkart API Error:', error);
        throw error;
    }
}

export async function transformFlipkartOrder(flipkartOrder) {
    // Transform Flipkart order format to our app format
    return {
        date: new Date(flipkartOrder.orderDate).getTime(),
        account: 'Flipkart',
        orderId: flipkartOrder.orderId,
        customerName: flipkartOrder.shippingAddress?.name || 'N/A',
        amount: parseFloat(flipkartOrder.priceComponents?.sellingPrice || 0),
        paymentType: flipkartOrder.paymentType === 'COD' ? 'COD' : 'Prepaid',
        status: mapFlipkartStatus(flipkartOrder.orderItemStatus),
        state: flipkartOrder.shippingAddress?.state || '',
        rto: flipkartOrder.orderItemStatus === 'RETURNED',
        replacement: flipkartOrder.orderItemStatus === 'REPLACEMENT',
        deliveredDate: flipkartOrder.orderItemStatus === 'DELIVERED'
            ? new Date(flipkartOrder.deliveryDate).getTime()
            : null
    };
}

function mapFlipkartStatus(flipkartStatus) {
    const statusMap = {
        'APPROVED': 'Pending',
        'PACKED': 'Pending',
        'READY_TO_DISPATCH': 'Pending',
        'SHIPPED': 'Shipped',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled',
        'RETURNED': 'RTO'
    };
    return statusMap[flipkartStatus] || 'Pending';
}

// Mock data generator for testing
function getMockOrders(startDate, endDate) {
    const mockOrders = [
        {
            orderId: 'OD123456789012345',
            orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            priceComponents: { sellingPrice: 2499 },
            orderItemStatus: 'SHIPPED',
            paymentType: 'COD',
            shippingAddress: {
                name: 'Rajesh Kumar',
                state: 'Maharashtra'
            },
            deliveryDate: null
        },
        {
            orderId: 'OD123456789012346',
            orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            priceComponents: { sellingPrice: 1899 },
            orderItemStatus: 'DELIVERED',
            paymentType: 'PREPAID',
            shippingAddress: {
                name: 'Priya Sharma',
                state: 'Karnataka'
            },
            deliveryDate: new Date().toISOString()
        },
        {
            orderId: 'OD123456789012347',
            orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            priceComponents: { sellingPrice: 3299 },
            orderItemStatus: 'APPROVED',
            paymentType: 'COD',
            shippingAddress: {
                name: 'Amit Patel',
                state: 'Delhi'
            },
            deliveryDate: null
        },
        {
            orderId: 'OD123456789012348',
            orderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            priceComponents: { sellingPrice: 1599 },
            orderItemStatus: 'SHIPPED',
            paymentType: 'PREPAID',
            shippingAddress: {
                name: 'Sneha Reddy',
                state: 'Telangana'
            },
            deliveryDate: null
        },
        {
            orderId: 'OD123456789012349',
            orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            priceComponents: { sellingPrice: 4999 },
            orderItemStatus: 'DELIVERED',
            paymentType: 'COD',
            shippingAddress: {
                name: 'Vikram Singh',
                state: 'Punjab'
            },
            deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    return mockOrders;
}
