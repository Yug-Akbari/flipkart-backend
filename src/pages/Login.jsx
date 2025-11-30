import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signup, login, loginWithGoogle } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        if (!isLogin && password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        if (!isLogin && password.length < 6) {
            return setError('Password must be at least 6 characters')
        }

        try {
            setError('')
            setLoading(true)
            if (isLogin) {
                await login(email, password)
            } else {
                await signup(email, password)
            }
            navigate('/')
        } catch (error) {
            setError(isLogin ? 'Failed to login: ' + error.message : 'Failed to create account: ' + error.message)
        }
        setLoading(false)
    }

    async function handleGoogleLogin() {
        try {
            setError('')
            setLoading(true)
            await loginWithGoogle()
            navigate('/')
        } catch (error) {
            setError('Failed to login with Google: ' + error.message)
        }
        setLoading(false)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Seller Dashboard</h1>
                <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    )}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>
                <div className="toggle-mode">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </div>
                <div className="divider">OR</div>
                <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
                    {isLogin ? 'Login' : 'Sign Up'} with Google
                </button>
            </div>
        </div>
    )
}
