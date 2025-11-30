import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { fetchAmazonOrders, transformAmazonOrder } from '../services/amazonApi'
import './AmazonSync.css'

export default function AmazonSync({ onSyncComplete }) {
    const { currentUser } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [credentials, setCredentials] = useState({
        sellerId: '',
        refreshToken: '',
        clientId: '',
        clientSecret: '',
        region: 'na' // North America
    })

    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    async function handleSync() {
        if (!credentials.sellerId || !credentials.refreshToken) {
            setError('Please fill in all required credentials')
            return
        }

        try {
            setError('')
            setSuccess('')
            setLoading(true)

            // Fetch orders from Amazon
            const amazonOrders = await fetchAmazonOrders(credentials, dateRange.startDate, dateRange.endDate)

            // Transform and save to Firestore
            const ordersRef = collection(db, 'orders')
            let importedCount = 0

            for (const amazonOrder of amazonOrders) {
                const transformedOrder = await transformAmazonOrder(amazonOrder)
                await addDoc(ordersRef, {
                    ...transformedOrder,
                    userId: currentUser.uid,
                    syncedFromAmazon: true,
                    lastSyncDate: Date.now()
                })
                importedCount++
            }

            setSuccess(`Successfully imported ${importedCount} orders from Amazon!`)
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
        localStorage.setItem('amazonCredentials', JSON.stringify(credentials))
        setSuccess('Credentials saved!')
    }

    function loadCredentials() {
        const saved = localStorage.getItem('amazonCredentials')
        if (saved) {
            setCredentials(JSON.parse(saved))
            setSuccess('Credentials loaded!')
        }
    }

    if (!isOpen) {
        return (
            <button className="amazon-sync-btn" onClick={() => setIsOpen(true)}>
                🔄 Sync from Amazon
            </button>
        )
    }

    return (
        <div className="amazon-sync-modal">
            <div className="modal-overlay" onClick={() => setIsOpen(false)} />
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Amazon SP-API Sync</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <div className="form-section">
                    <h3>API Credentials</h3>
                    <p className="help-text">
                        Get these from Amazon Seller Central → Apps & Services → Develop Apps
                    </p>

                    <input
                        type="text"
                        placeholder="Seller ID"
                        value={credentials.sellerId}
                        onChange={(e) => setCredentials({ ...credentials, sellerId: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Refresh Token"
                        value={credentials.refreshToken}
                        onChange={(e) => setCredentials({ ...credentials, refreshToken: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Client ID (LWA)"
                        value={credentials.clientId}
                        onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    />

                    <input
                        type="password"
                        placeholder="Client Secret (LWA)"
                        value={credentials.clientSecret}
                        onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                    />

                    <select
                        value={credentials.region}
                        onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
                    >
                        <option value="na">North America</option>
                        <option value="eu">Europe</option>
                        <option value="fe">Far East</option>
                    </select>

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
                    Amazon SP-API cannot be called directly from the browser due to security restrictions.
                    <br /><br />
                    See <code>AMAZON_API_SETUP.md</code> for backend setup instructions.
                </div>
            </div>
        </div>
    )
}
