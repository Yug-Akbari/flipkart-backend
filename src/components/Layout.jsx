import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

export default function Layout() {
    const { logout, currentUser } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <div className="layout">
            <nav className="navbar">
                <div className="nav-brand">Seller Dashboard</div>
                <div className="nav-links">
                    <Link to="/">Dashboard</Link>
                    <Link to="/orders">Orders</Link>
                    <Link to="/reports">Reports</Link>
                </div>
                <div className="nav-user">
                    <span>{currentUser?.email}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}
