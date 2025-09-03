'use client'

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface DebateMessage {
  id: string
  type: 'coach' | 'student'
  content: string
  timestamp: Date
  isStelling?: boolean
  isTegenargument?: boolean
  isFeedback?: boolean
  isReflectie?: boolean
}

interface DebateSession {
  stelling: string
  rondeNummer: number
  maxRondes: number
  isCompleted: boolean
  startTime: Date
}

export default function DebateCoach() {
  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<DebateSession | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (type: 'coach' | 'student', content: string, options?: {
    isStelling?: boolean
    isTegenargument?: boolean
    isFeedback?: boolean
    isReflectie?: boolean
  }) => {
    const newMessage: DebateMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      ...options
    }
    setMessages(prev => [...prev, newMessage])
  }

  const startDebate = async () => {
    setIsLoading(true)
    setIsStarted(true)
    setMessages([])
    
    try {
      // Vraag Gemini om een actuele stelling te genereren
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Genereer een actuele, maatschappelijk relevante debat-stelling voor havo/vwo leerlingen. De stelling moet:
          - Actueel zijn (2024/2025)
          - Controversieel genoeg voor een goed debat
          - Begrijpelijk voor tieners
          - Relevant voor hun leefwereld
          
          Geef alleen de stelling terug, geen uitleg. Begin met "Stelling:" en geef dan één heldere zin.
          
          Voorbeelden van goede stellingen:
          - TikTok zou verboden moeten worden voor jongeren onder de 16
          - Scholen moeten AI-tools zoals ChatGPT volledig verbieden
          - Nederland moet een vierdaagse werkweek invoeren
          
          Genereer nu een nieuwe, actuele stelling:`,
          aiModel: 'internet',
          useGrounding: true
        }),
      })

      if (!response.ok) {
        throw new Error('Kon geen stelling genereren')
      }

      const data = await response.json()
      const stelling = data.response.replace(/^Stelling:\s*/i, '').trim()
      
      // Start nieuwe sessie
      const newSession: DebateSession = {
        stelling,
        rondeNummer: 1,
        maxRondes: 4,
        isCompleted: false,
        startTime: new Date()
      }
      setSession(newSession)

      // Voeg welkomstbericht toe
      addMessage('coach', `Welkom bij je debattraining! 🎯

**Stelling:** ${stelling}

Ik ga je uitdagen met tegenargumenten. Jouw taak is om sterke reacties te geven die je standpunt verdedigen.

**Eerste tegenargument:** Laten we beginnen met een praktisch punt - deze maatregel zou veel te duur zijn om uit te voeren. Hoe reageer je daarop?`, {
        isStelling: true,
        isTegenargument: true
      })

    } catch (error) {
      console.error('Error starting debate:', error)
      addMessage('coach', 'Sorry, ik kon geen debat starten. Controleer of je API key correct is ingesteld. 😔')
    } finally {
      setIsLoading(false)
    }
  }

  const sendResponse = async () => {
    if (!currentMessage.trim() || !session || isLoading) return

    // Voeg student reactie toe
    addMessage('student', currentMessage)
    const studentResponse = currentMessage
    setCurrentMessage('')
    setIsLoading(true)

    try {
      // Bepaal wat voor reactie we nodig hebben
      const isLastRound = session.rondeNummer >= session.maxRondes
      
      let prompt = ''
      
      if (isLastRound) {
        // Laatste ronde - geef samenvatting en reflectie
        prompt = `Je bent een debatcoach. De leerling heeft zojuist gereageerd op tegenargument ${session.rondeNummer} over de stelling: "${session.stelling}"

Leerling reactie: "${studentResponse}"

Dit was de laatste ronde. Geef nu:
1. Korte feedback op deze laatste reactie (1-2 zinnen)
2. Samenvatting van sterke punten en verbeterpunten van het hele debat (2-3 zinnen)
3. Een reflectievraag zoals "Hoe zou je dit debat anders aanpakken in een klas?" of "Welk argument vond je het moeilijkst om te weerleggen?"

Houd het vriendelijk, constructief en motiverend. Max 6 zinnen totaal.`
      } else {
        // Normale ronde - feedback + nieuw tegenargument
        const perspectieven = [
          'economisch (kosten, banen, groei)',
          'ethisch (goed/fout, rechtvaardigheid)',
          'praktisch (uitvoerbaarheid, logistiek)',
          'emotioneel (gevoelens, angsten)',
          'juridisch (wetten, rechten)',
          'wetenschappelijk (onderzoek, feiten)',
          'sociaal (gemeenschap, samenleving)',
          'technologisch (innovatie, digitalisering)'
        ]
        
        const volgendePerspectief = perspectieven[session.rondeNummer % perspectieven.length]
        
        prompt = `Je bent een debatcoach. De leerling reageert op tegenargument ${session.rondeNummer} over de stelling: "${session.stelling}"

Leerling reactie: "${studentResponse}"

Geef:
1. Korte feedback (1 zin wat goed is, 1 zin wat beter kan)
2. Nieuw tegenargument vanuit ${volgendePerspectief} perspectief (max 2 zinnen)

Houd het kort, vriendelijk en uitdagend. Max 4 zinnen totaal.`
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          aiModel: 'smart'
        }),
      })

      if (!response.ok) {
        throw new Error('Kon geen reactie genereren')
      }

      const data = await response.json()
      
      if (isLastRound) {
        // Sessie afronden
        addMessage('coach', data.response, { isFeedback: true, isReflectie: true })
        setSession(prev => prev ? { ...prev, isCompleted: true } : null)
      } else {
        // Volgende ronde
        addMessage('coach', data.response, { isFeedback: true, isTegenargument: true })
        setSession(prev => prev ? { ...prev, rondeNummer: prev.rondeNummer + 1 } : null)
      }

    } catch (error) {
      console.error('Error sending response:', error)
      addMessage('coach', 'Sorry, er ging iets mis. Probeer het opnieuw. 😔')
    } finally {
      setIsLoading(false)
    }
  }

  const resetDebate = () => {
    setMessages([])
    setSession(null)
    setIsStarted(false)
    setCurrentMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendResponse()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Debattraining</h2>
            {session && (
              <div className="text-blue-100 text-sm mt-1">
                <span className="font-medium">Stelling:</span> {session.stelling}
              </div>
            )}
          </div>
          
          {session && (
            <div className="text-right">
              <div className="text-blue-100 text-sm">
                Ronde {session.rondeNummer} van {session.maxRondes}
              </div>
              <div className="w-24 bg-blue-500 rounded-full h-2 mt-1">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(session.rondeNummer / session.maxRondes) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {!isStarted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8V4l4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Klaar voor je debattraining?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Ik ga je uitdagen met een actuele stelling en tegenargumenten. 
              Jouw taak is om sterke reacties te geven!
            </p>
            <button
              onClick={startDebate}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? '🎲 Stelling wordt gegenereerd...' : '🚀 Start Debat'}
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.type === 'student'
                      ? 'bg-blue-600 text-white'
                      : message.isStelling
                      ? 'bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200'
                      : message.isTegenargument && !message.isFeedback
                      ? 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-200'
                      : message.isFeedback
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200'
                      : message.isReflectie
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  {message.type === 'coach' && (
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🎯</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {message.isStelling ? 'Stelling & Eerste Tegenargument' :
                         message.isTegenargument && !message.isFeedback ? 'Tegenargument' :
                         message.isFeedback && !message.isReflectie ? 'Feedback & Nieuw Tegenargument' :
                         message.isReflectie ? 'Samenvatting & Reflectie' :
                         'Debatcoach'}
                      </span>
                    </div>
                  )}
                  
                  {message.type === 'student' && (
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">👤</span>
                      </div>
                      <span className="text-sm font-medium text-blue-100">
                        Jouw reactie
                      </span>
                    </div>
                  )}

                  <MarkdownRenderer 
                    content={message.content}
                    className={message.type === 'student' ? 'text-white' : 'text-gray-800'}
                  />
                  
                  <div className={`text-xs mt-2 ${
                    message.type === 'student' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('nl-NL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 max-w-3xl">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">🎯</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Debatcoach</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-gray-600 text-sm">Ik denk na over mijn reactie...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {isStarted && session && !session.isCompleted && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Typ je reactie op het tegenargument..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  💡 Tip: Geef concrete voorbeelden en denk aan verschillende perspectieven
                </div>
                <div className="text-xs text-gray-400">
                  Enter = verzenden • Shift+Enter = nieuwe regel
                </div>
              </div>
            </div>
            
            <button
              onClick={sendResponse}
              disabled={isLoading || !currentMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳' : '📤 Reageren'}
            </button>
          </div>
        </div>
      )}

      {/* Session Completed */}
      {session?.isCompleted && (
        <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🎉 Debat voltooid!
            </h3>
            <p className="text-gray-600 mb-4">
              Je hebt alle rondes doorlopen. Goed gedaan!
            </p>
            <button
              onClick={resetDebate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🔄 Nieuw Debat Starten
            </button>
          </div>
        </div>
      )}

      {/* Reset Button (always available when started) */}
      {isStarted && (
        <div className="absolute top-4 right-4">
          <button
            onClick={resetDebate}
            className="px-3 py-1 bg-white bg-opacity-20 text-blue-600 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
            title="Nieuw debat starten"
          >
            🔄 Reset
          </button>
        </div>
      )}
    </div>
  )
}