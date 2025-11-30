import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Papa from 'papaparse'
import './Reports.css'

export default function Reports() {
    const { currentUser } = useAuth()
    const [orders, setOrders] = useState([])
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalOrders: 0,
        cod: 0,
        prepaid: 0,
        rtoCount: 0,
        deliveredCount: 0
    })

    useEffect(() => {
        loadOrders()
    }, [currentUser])

    useEffect(() => {
        calculateSummary()
    }, [orders, startDate, endDate])

    async function loadOrders() {
        try {
            const ordersRef = collection(db, 'orders')
            const q = query(ordersRef, where('userId', '==', currentUser.uid))
            const snapshot = await getDocs(q)
            const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setOrders(ordersList)
        } catch (error) {
            console.error('Error loading orders:', error)
        }
    }

    function calculateSummary() {
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime() + 86400000 // End of day

        const filtered = orders.filter(o => o.date >= start && o.date < end)

        setSummary({
            totalSales: filtered.reduce((sum, o) => sum + (o.amount || 0), 0),
            totalOrders: filtered.length,
            cod: filtered.filter(o => o.paymentType === 'COD').reduce((sum, o) => sum + (o.amount || 0), 0),
            prepaid: filtered.filter(o => o.paymentType === 'Prepaid').reduce((sum, o) => sum + (o.amount || 0), 0),
            rtoCount: filtered.filter(o => o.rto).length,
            deliveredCount: filtered.filter(o => o.status === 'Delivered').length
        })
    }

    function downloadExcel() {
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime() + 86400000

        const filtered = orders.filter(o => o.date >= start && o.date < end)

        const data = filtered.map(o => ({
            Date: format(new Date(o.date), 'dd/MM/yyyy'),
            'Order ID': o.orderId,
            Customer: o.customerName,
            State: o.state,
            Amount: o.amount,
            Payment: o.paymentType,
            Status: o.status,
            RTO: o.rto ? 'Yes' : 'No',
            Replacement: o.replacement ? 'Yes' : 'No'
        }))

        const csv = Papa.unparse(data)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders_${startDate}_to_${endDate}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="reports">
            <h1>Reports</h1>

            <div className="date-filters">
                <div>
                    <label>Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label>End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button onClick={downloadExcel} className="download-btn">
                    Download Excel
                </button>
            </div>

            <div className="summary-grid">
                <div className="summary-card">
                    <h3>Total Sales</h3>
                    <p className="summary-value">₹{summary.totalSales.toLocaleString()}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Orders</h3>
                    <p className="summary-value">{summary.totalOrders}</p>
                </div>
                <div className="summary-card">
                    <h3>COD Sales</h3>
                    <p className="summary-value">₹{summary.cod.toLocaleString()}</p>
                </div>
                <div className="summary-card">
                    <h3>Prepaid Sales</h3>
                    <p className="summary-value">₹{summary.prepaid.toLocaleString()}</p>
                </div>
                <div className="summary-card">
                    <h3>Delivered</h3>
                    <p className="summary-value">{summary.deliveredCount}</p>
                </div>
                <div className="summary-card">
                    <h3>RTO Count</h3>
                    <p className="summary-value">{summary.rtoCount}</p>
                </div>
            </div>
        </div>
    )
}
