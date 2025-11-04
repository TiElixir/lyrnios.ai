import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Settings, User, Home } from 'lucide-react'
import ErrorCard from './ErrorCard'
import Chat from './Chat'

function Session() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = decodeURIComponent(searchParams.get('q') || '')
  const urlApiEndpoint = searchParams.get('api') || 'generate'
  const [error, setError] = useState(null)
  const [apiEndpoint, setApiEndpoint] = useState(urlApiEndpoint) // 'demo' or 'generate'

  const handleResponseUpdate = (data) => {
    // Handle response update if needed
  }

  const toggleApiEndpoint = () => {
    setApiEndpoint(prev => prev === 'demo' ? 'generate' : 'demo')
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-bg-gradient-start via-bg-gradient-mid to-bg-gradient-end">
        {/* Sidebar */}
        <div className="w-24 bg-sidebar border-r border-border flex flex-col items-center py-6 space-y-6">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 text-icon-on-button" />
          </button>
          
          <button className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center">
            <Plus className="w-5 h-5 text-icon-on-button" />
          </button>
          
          <button className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center">
            <Settings className="w-5 h-5 text-icon-on-button" />
          </button>
          
          <button className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center">
            <User className="w-5 h-5 text-icon-on-button" />
          </button>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-2xl w-full">
            <ErrorCard error={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-bg-gradient-start via-bg-gradient-mid to-bg-gradient-end">
      {/* Sidebar */}
      <div className="w-24 bg-sidebar border-r border-border flex flex-col items-center py-6 space-y-6">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center"
          title="Home"
        >
          <Home className="w-5 h-5 text-black" />
        </button>
        
        <button 
          className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center"
          title="New Chat"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
        
        <button 
          className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-black" />
        </button>
        
        <button 
          className="w-12 h-12 rounded-full bg-button hover:bg-button-hover transition-colors flex items-center justify-center"
          title="Profile"
        >
          <User className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-sidebar-opacity backdrop-blur-sm border-b border-border px-8 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-text-primary">lyrnios.ai</h1>
              <p className="text-xs text-text-secondary mt-1 font-mono">
                Session: {id.slice(0, 8)}...
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* API Endpoint Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-mono">API:</span>
                <button
                  onClick={toggleApiEndpoint}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    apiEndpoint === 'demo' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}
                  title={`Currently using /${apiEndpoint} endpoint. Click to switch.`}
                >
                  /{apiEndpoint}
                </button>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 rounded-full bg-button hover:bg-button-hover text-icon-on-button text-sm transition-colors"
              >
                New Query
              </button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <Chat 
            initialQuery={query} 
            onResponseUpdate={handleResponseUpdate}
            apiEndpoint={apiEndpoint}
            onApiEndpointChange={setApiEndpoint}
          />
        </div>
      </div>
    </div>
  )
}

export default Session