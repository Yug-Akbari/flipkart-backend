import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import FlipkartSync from '../components/FlipkartSync'
import './Orders.css'

export default function Orders() {
    const { currentUser } = useAuth()
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [paymentFilter, setPaymentFilter] = useState('All')

    useEffect(() => {
        loadOrders()
    }, [currentUser])

    useEffect(() => {
        filterOrders()
    }, [orders, searchTerm, statusFilter, paymentFilter])

    async function loadOrders() {
        try {
            const ordersRef = collection(db, 'orders')
            const q = query(ordersRef, where('userId', '==', currentUser.uid))
            const snapshot = await getDocs(q)
            const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setOrders(ordersList)
            setLoading(false)
        } catch (error) {
            console.error('Error loading orders:', error)
            setLoading(false)
        }
    }

    function filterOrders() {
        let filtered = orders

        if (searchTerm) {
            filtered = filtered.filter(o =>
                o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.state?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(o => o.status === statusFilter)
        }

        if (paymentFilter !== 'All') {
            filtered = filtered.filter(o => o.paymentType === paymentFilter)
        }

        setFilteredOrders(filtered)
    }



    async function updateOrderStatus(orderId, newStatus) {
        try {
            const orderRef = doc(db, 'orders', orderId)
            await updateDoc(orderRef, {
                status: newStatus,
                deliveredDate: newStatus === 'Delivered' ? Date.now() : null
            })
            loadOrders()
        } catch (error) {
            console.error('Error updating order:', error)
        }
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="orders">
            <div className="orders-header">
                <h1>Orders</h1>
                <FlipkartSync onSyncComplete={loadOrders} />
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by Order ID, Customer, State..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All</option>
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                </select>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                    <option>All</option>
                    <option>COD</option>
                    <option>Prepaid</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>State</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>RTO</th>
                            <th>Replacement</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td>{format(new Date(order.date), 'dd/MM/yyyy')}</td>
                                <td>{order.orderId}</td>
                                <td>{order.customerName}</td>
                                <td>{order.state}</td>
                                <td>₹{order.amount}</td>
                                <td><span className={`badge ${order.paymentType?.toLowerCase()}`}>{order.paymentType}</span></td>
                                <td><span className={`badge ${order.status?.toLowerCase()}`}>{order.status}</span></td>
                                <td>{order.rto ? '✓' : ''}</td>
                                <td>{order.replacement ? '✓' : ''}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option>Pending</option>
                                        <option>Shipped</option>
                                        <option>Delivered</option>
                                        <option>Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="no-data">No orders found. Import CSV to get started.</div>
                )}
            </div>
        </div>
    )
}
