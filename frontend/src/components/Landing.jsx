import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Send, Settings, MessageSquare, X } from 'lucide-react'
import RotatingText from './RotatingText'
import { useAuth } from '../context/AuthContext'
import UserProfile from './UserProfile'
import ChatHistory from './ChatHistory'


function Landing() {
  const [query, setQuery] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('generate') // 'demo' or 'generate'
  const [showChats, setShowChats] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      const sessionId = uuidv4()
      const encodedQuery = encodeURIComponent(query.trim())
      // Pass the API endpoint as a URL parameter
      navigate(`/session/${sessionId}?q=${encodedQuery}&api=${apiEndpoint}`)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
  }

  const toggleApiEndpoint = () => {
    setApiEndpoint(prev => prev === 'demo' ? 'generate' : 'demo')
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">


      {/* Infinite Scrolling Background */}


      <div className="flex h-full bg-gradient-to-br from-bg-gradient-start via-bg-gradient-mid to-bg-gradient-end relative z-10"
        style={{
          backgroundImage: `url("/bg-pattern.png")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "color",
          minHeight: "100vh"


        }}>

        {/* Sidebar */}
        {showChats ? (
          <div className="relative z-20 flex">
            <ChatHistory />
            <button
              onClick={() => setShowChats(false)}
              className="absolute top-4 right-[-40px] w-8 h-8 rounded-full bg-card-opacity backdrop-blur-sm border border-border flex items-center justify-center hover:bg-button-hover transition-colors"
              title="Hide chats"
            >
              <X className="w-4 h-4 text-text-primary" />
            </button>
          </div>
        ) : (
          <div className="w-24 bg-sidebar border-r border-border flex flex-col items-center py-6 space-y-6 z-20">
            <button
              onClick={() => setShowChats(true)}
              className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center"
              title="Show chats"
            >
              <MessageSquare className="w-5 h-5 text-icon-on-button" />
            </button>

            <button className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center">
              <Settings className="w-5 h-5 text-icon-on-button" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 absolute inset-0 z-5">

          {/* Top Right Controls */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
            {isAuthenticated && <UserProfile />}

            <div className="flex items-center gap-2 bg-card-opacity backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <span className="text-xs text-text-secondary font-mono">API:</span>
              <button
                onClick={toggleApiEndpoint}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${apiEndpoint === 'demo'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white'
                  }`}
                title={`Currently using /${apiEndpoint} endpoint. Click to switch.`}
              >
                /{apiEndpoint}
              </button>
            </div>
          </div>

          <div className="max-w-4xl w-full space-y-8">

            {/* Header */}
            <div className="text-center space-y-4 flex flex-col items-center">

              <div className='flex flex-row items-center'>

                <RotatingText
                  texts={['Hello', 'नमस्ते', 'নমস্কার', 'నమస్కారం', 'ନମସ୍କାର']}
                  mainClassName="select-none text-6xl font-bold px-2 sm:px-2 md:px-3 bg-black-200 text-black overflow-hidden pt-1 justify-center rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />

                <p className="select-none text-6xl font-bold px-2 sm:px-2 md:px-3 bg-black-200 text-black overflow-hidden py-0.5 justify-center rounded-lg">
                  Student
                </p>


              </div>

              <p className="text-2xl text-text-tertiary select-none">
                What do you want to learn about?
              </p>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="bg-card-opacity backdrop-blur-md rounded-3xl shadow-lg border border-white border-md p-6 transform hover:border-black
              -200 duration-100">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center mt-1"
                  >
                    <Plus className="w-6 h-6 text-icon-on-button" />
                  </button>

                  <textarea

                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me something..."
                    className="flex-1 bg-transparent text-lg text-text-primary placeholder-text-secondary outline-none resize-none min-h-[60px] max-h-[200px] mt-4"
                    rows={3}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-button hover:bg-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mt-1"
                  >
                    <Send className="w-5 h-5 text-icon-on-button" />
                  </button>
                </div>

                {/* Suggestion Pills */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick('Teach me about linear regression.')}
                    className="px-6 py-2 rounded-full bg-button-opacity hover:bg-button text-text-primary text-sm transition-colors"
                  >
                    Teach me about linear regression.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick('How do garbage collectors work?')}
                    className="px-6 py-2 rounded-full bg-button-opacity hover:bg-button text-text-primary text-sm transition-colors"
                  >
                    How do garbage collectors work?
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick('How do I understand equations of motion?')}
                    className="px-6 py-2 rounded-full bg-button-opacity hover:bg-button text-text-primary text-sm transition-colors"
                  >
                    How do I understand equations of motion?
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>

    </div>
  )
}

export default Landing