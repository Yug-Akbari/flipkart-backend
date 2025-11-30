// Amazon SP-API Integration via Backend Server
// Set USE_MOCK_DATA to false when your backend is running

const USE_MOCK_DATA = false; // Change to false to use real Amazon API

export async function fetchAmazonOrders(credentials, startDate, endDate) {
    // Mock data for testing without backend
    if (USE_MOCK_DATA) {
        console.log('Using mock Amazon data for testing');
        return getMockOrders(startDate, endDate);
    }

    // Real implementation - calls your backend server
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
        const response = await fetch(`${apiUrl}/api/amazon/orders`, {
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
            throw new Error(error.details || 'Failed to fetch orders from Amazon');
        }

        const data = await response.json();
        return data.orders || [];
    } catch (error) {
        console.error('Amazon API Error:', error);
        throw error;
    }
}

export async function transformAmazonOrder(amazonOrder) {
    // Transform Amazon order format to our app format
    return {
        date: new Date(amazonOrder.PurchaseDate).getTime(),
        account: 'Amazon',
        orderId: amazonOrder.AmazonOrderId,
        customerName: amazonOrder.BuyerInfo?.BuyerName || 'N/A',
        amount: parseFloat(amazonOrder.OrderTotal?.Amount || 0),
        paymentType: amazonOrder.PaymentMethod === 'COD' ? 'COD' : 'Prepaid',
        status: mapAmazonStatus(amazonOrder.OrderStatus),
        state: amazonOrder.ShippingAddress?.StateOrRegion || '',
        rto: amazonOrder.OrderStatus === 'Returned',
        replacement: false,
        deliveredDate: amazonOrder.OrderStatus === 'Delivered'
            ? new Date(amazonOrder.LastUpdateDate).getTime()
            : null
    };
}

function mapAmazonStatus(amazonStatus) {
    const statusMap = {
        'Pending': 'Pending',
        'Unshipped': 'Pending',
        'PartiallyShipped': 'Shipped',
        'Shipped': 'Shipped',
        'Delivered': 'Delivered',
        'Canceled': 'Cancelled',
        'Unfulfillable': 'Cancelled'
    };
    return statusMap[amazonStatus] || 'Pending';
}

// Mock data generator for testing
function getMockOrders(startDate, endDate) {
    const mockOrders = [
        {
            AmazonOrderId: 'AMZ-TEST-001',
            PurchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            OrderTotal: { Amount: '2499', CurrencyCode: 'INR' },
            OrderStatus: 'Shipped',
            PaymentMethod: 'COD',
            ShippingAddress: { StateOrRegion: 'Maharashtra' },
            BuyerInfo: { BuyerName: 'Rajesh Kumar' },
            LastUpdateDate: new Date().toISOString()
        },
        {
            AmazonOrderId: 'AMZ-TEST-002',
            PurchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            OrderTotal: { Amount: '1899', CurrencyCode: 'INR' },
            OrderStatus: 'Delivered',
            PaymentMethod: 'Prepaid',
            ShippingAddress: { StateOrRegion: 'Karnataka' },
            BuyerInfo: { BuyerName: 'Priya Sharma' },
            LastUpdateDate: new Date().toISOString()
        },
        {
            AmazonOrderId: 'AMZ-TEST-003',
            PurchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            OrderTotal: { Amount: '3299', CurrencyCode: 'INR' },
            OrderStatus: 'Pending',
            PaymentMethod: 'COD',
            ShippingAddress: { StateOrRegion: 'Delhi' },
            BuyerInfo: { BuyerName: 'Amit Patel' },
            LastUpdateDate: new Date().toISOString()
        }
    ];

    return mockOrders;
}
