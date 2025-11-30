import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfDay } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
    const { currentUser } = useAuth()
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayAmount: 0,
        shipped: 0,
        delivered: 0,
        rto: 0,
        replacement: 0,
        cod: 0,
        prepaid: 0
    })
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [currentUser])

    async function loadDashboardData() {
        try {
            const ordersRef = collection(db, 'orders')
            const q = query(ordersRef, where('userId', '==', currentUser.uid))
            const snapshot = await getDocs(q)

            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const today = startOfDay(new Date()).getTime()

            const todayOrders = orders.filter(o => o.date >= today)

            const newStats = {
                todayOrders: todayOrders.length,
                todayAmount: todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
                shipped: orders.filter(o => o.status === 'Shipped').length,
                delivered: orders.filter(o => o.status === 'Delivered').length,
                rto: orders.filter(o => o.rto).length,
                replacement: orders.filter(o => o.replacement).length,
                cod: orders.filter(o => o.paymentType === 'COD').length,
                prepaid: orders.filter(o => o.paymentType === 'Prepaid').length
            }

            setStats(newStats)

            // Chart data - last 7 days
            const last7Days = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dayStart = startOfDay(date).getTime()
                const dayEnd = dayStart + 86400000

                const dayOrders = orders.filter(o => o.date >= dayStart && o.date < dayEnd)
                last7Days.push({
                    date: format(date, 'MMM dd'),
                    sales: dayOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
                })
            }

            setChartData(last7Days)
            setLoading(false)
        } catch (error) {
            console.error('Error loading dashboard:', error)
            setLoading(false)
        }
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <h3>Today's Orders</h3>
                    <p className="stat-value">{stats.todayOrders}</p>
                </div>
                <div className="stat-card primary">
                    <h3>Today's Amount</h3>
                    <p className="stat-value">₹{stats.todayAmount.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <h3>Shipped</h3>
                    <p className="stat-value">{stats.shipped}</p>
                </div>
                <div className="stat-card success">
                    <h3>Delivered</h3>
                    <p className="stat-value">{stats.delivered}</p>
                </div>
                <div className="stat-card warning">
                    <h3>RTO</h3>
                    <p className="stat-value">{stats.rto}</p>
                </div>
                <div className="stat-card info">
                    <h3>Replacement</h3>
                    <p className="stat-value">{stats.replacement}</p>
                </div>
                <div className="stat-card">
                    <h3>COD</h3>
                    <p className="stat-value">{stats.cod}</p>
                </div>
                <div className="stat-card">
                    <h3>Prepaid</h3>
                    <p className="stat-value">{stats.prepaid}</p>
                </div>
            </div>

            <div className="chart-container">
                <h2>Last 7 Days Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#1976d2" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
