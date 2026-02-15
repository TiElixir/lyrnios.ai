import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, MessageSquare, Clock } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

function ChatHistory() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const { apiClient } = useAuth()
    const navigate = useNavigate()
    const { id: currentSessionId } = useParams()

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            const response = await apiClient.get('/sessions')
            setSessions(response.data)
        } catch (error) {
            console.error('Failed to fetch sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNewChat = () => {
        navigate('/')
    }

    const handleSessionClick = (sessionId) => {
        navigate(`/session/${sessionId}?q=&api=generate&load=true`)
    }

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation()
        try {
            await apiClient.delete(`/sessions/${sessionId}`)
            setSessions(prev => prev.filter(s => s.id !== sessionId))
            if (currentSessionId === sessionId) {
                navigate('/')
            }
        } catch (error) {
            console.error('Failed to delete session:', error)
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="w-72 bg-sidebar border-r border-border flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     bg-button hover:bg-button-hover text-icon-on-button
                     transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto py-2">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-loading animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-loading animate-pulse" style={{ animationDelay: '300ms' }} />
                            <div className="w-2 h-2 rounded-full bg-loading animate-pulse" style={{ animationDelay: '600ms' }} />
                        </div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <MessageSquare className="w-8 h-8 text-text-secondary mb-3 opacity-40" />
                        <p className="text-sm text-text-secondary opacity-60">No conversations yet</p>
                        <p className="text-xs text-text-secondary opacity-40 mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {sessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => handleSessionClick(session.id)}
                                className={`group mx-2 mb-1 px-3 py-3 rounded-xl cursor-pointer
                           transition-colors flex items-start gap-3
                           ${currentSessionId === session.id
                                        ? 'bg-card-opacity border border-border'
                                        : 'hover:bg-card-opacity'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary truncate font-medium">
                                        {session.title}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3 text-text-secondary opacity-50" />
                                        <span className="text-xs text-text-secondary opacity-50">
                                            {formatDate(session.updated_at)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg
                             hover:bg-red-100 transition-all flex-shrink-0"
                                    title="Delete session"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

export default ChatHistory
