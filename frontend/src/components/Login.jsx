import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

function Login() {
    const { loginWithGoogle, loading } = useAuth()

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-bg-gradient-start via-bg-gradient-mid to-bg-gradient-end">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-loading animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 rounded-full bg-loading animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="w-3 h-3 rounded-full bg-loading animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>
            </div>
        )
    }

    return (
        <div
            className="h-screen w-screen flex items-center justify-center overflow-hidden"
            style={{
                backgroundImage: `url("/bg-pattern.png")`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Glass card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center gap-8 px-12 py-14 rounded-3xl
                   bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl
                   max-w-md w-full mx-4"
            >
                {/* Logo */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl font-bold font-serif">L</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                        lyrnios.ai
                    </h1>
                    <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
                        Your AI-powered learning assistant. Ask anything, learn everything.
                    </p>
                </div>

                {/* Divider */}
                <div className="w-full flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Sign in to continue</span>
                    <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Google Sign-in Button */}
                <motion.button
                    onClick={loginWithGoogle}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
                     bg-white border border-gray-200 shadow-md
                     text-gray-700 font-medium text-base
                     hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    {/* Google Logo SVG */}
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Continue with Google
                </motion.button>

                {/* Footer */}
                <p className="text-xs text-gray-400 text-center">
                    By signing in, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    )
}

export default Login
