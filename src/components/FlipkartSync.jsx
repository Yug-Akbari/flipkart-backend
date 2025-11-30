import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { fetchFlipkartOrders, transformFlipkartOrder } from '../services/flipkartApi'
import './FlipkartSync.css'

export default function FlipkartSync({ onSyncComplete }) {
    const { currentUser } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Load default credentials from environment variables (if exposed)
    // For security, credentials should be entered by user or stored server-side
    const [credentials, setCredentials] = useState({
        appId: '',
        appSecret: ''
    })

    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    async function handleSync() {
        if (!credentials.appId || !credentials.appSecret) {
            setError('Please fill in all required credentials')
            return
        }

        try {
            setError('')
            setSuccess('')
            setLoading(true)

            // Fetch orders from Flipkart
            const flipkartOrders = await fetchFlipkartOrders(credentials, dateRange.startDate, dateRange.endDate)

            // Transform and save to Firestore
            const ordersRef = collection(db, 'orders')
            let importedCount = 0

            for (const flipkartOrder of flipkartOrders) {
                const transformedOrder = await transformFlipkartOrder(flipkartOrder)
                await addDoc(ordersRef, {
                    ...transformedOrder,
                    userId: currentUser.uid,
                    syncedFromFlipkart: true,
                    lastSyncDate: Date.now()
                })
                importedCount++
            }

            setSuccess(`Successfully imported ${importedCount} orders from Flipkart!`)
            setLoading(false)

            if (onSyncComplete) {
                setTimeout(() => {
                    onSyncComplete()
                    setIsOpen(false)
                }, 2000)
            }
        } catch (error) {
            console.error('Sync error:', error)
            setError('Failed to sync: ' + error.message)
            setLoading(false)
        }
    }

    function saveCredentials() {
        // Save to localStorage for convenience (in production, use secure storage)
        localStorage.setItem('flipkartCredentials', JSON.stringify(credentials))
        setSuccess('Credentials saved!')
    }

    function loadCredentials() {
        const saved = localStorage.getItem('flipkartCredentials')
        if (saved) {
            setCredentials(JSON.parse(saved))
            setSuccess('Credentials loaded!')
        }
    }

    if (!isOpen) {
        return (
            <button className="flipkart-sync-btn" onClick={() => setIsOpen(true)}>
                🔄 Sync from Flipkart
            </button>
        )
    }

    return (
        <div className="flipkart-sync-modal">
            <div className="modal-overlay" onClick={() => setIsOpen(false)} />
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Flipkart Seller API Sync</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                {/* Always show credentials section for security */}
                <div className="form-section">
                    <h3>API Credentials</h3>
                    <p className="help-text">
                        Get these from Flipkart Seller Hub → Settings → API Credentials
                    </p>

                    <input
                        type="text"
                        placeholder="Application ID"
                        value={credentials.appId}
                        onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
                    />

                    <input
                        type="password"
                        placeholder="Application Secret"
                        value={credentials.appSecret}
                        onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
                    />

                    <div className="button-group">
                        <button onClick={saveCredentials} className="secondary-btn">
                            Save Credentials
                        </button>
                        <button onClick={loadCredentials} className="secondary-btn">
                            Load Saved
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Date Range</h3>
                    <div className="date-inputs">
                        <div>
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="sync-btn"
                    onClick={handleSync}
                    disabled={loading}
                >
                    {loading ? 'Syncing...' : 'Sync Orders'}
                </button>

                <div className="info-box">
                    <strong>⚠️ Important:</strong> This requires a backend server to work.
                    Flipkart Seller API cannot be called directly from the browser due to security restrictions.
                    <br /><br />
                    See <code>GET_FLIPKART_CREDENTIALS.md</code> for setup instructions.
                </div>
            </div>
        </div>
    )
}
