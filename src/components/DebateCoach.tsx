'use client'

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import FeedbackPanel from './FeedbackPanel'
import SpeechControls from './SpeechControls'

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

interface FeedbackData {
  goodPoints: string[]
  improvements: string[]
  example: string
  rondeNummer: number
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
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null)
  
  // Speech states
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const speechControls = SpeechControls({
    onTranscript: (text: string) => {
      setCurrentMessage(prev => prev + (prev ? ' ' : '') + text)
    },
    onSpeakText: () => {},
    isListening,
    setIsListening,
    isSpeaking,
    setIsSpeaking
  })

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

    // Auto-speak coach messages if TTS is enabled
    if (type === 'coach' && ttsEnabled && speechControls.isSupported) {
      setTimeout(() => {
        speechControls.speakText(content)
      }, 500)
    }
  }

  const parseFeedbackResponse = (response: string) => {
    const lines = response.split('\n').filter(line => line.trim())
    
    const feedback: FeedbackData = {
      goodPoints: [],
      improvements: [],
      example: '',
      rondeNummer: session?.rondeNummer || 1
    }

    let currentSection = ''
    let tegenargument = ''

    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.toLowerCase().includes('goed:') || trimmed.toLowerCase().includes('positief:')) {
        currentSection = 'good'
        const content = trimmed.replace(/^.*?goed:\s*/i, '').replace(/^.*?positief:\s*/i, '')
        if (content) feedback.goodPoints.push(content)
      } else if (trimmed.toLowerCase().includes('verbetering:') || trimmed.toLowerCase().includes('beter:')) {
        currentSection = 'improvement'
        const content = trimmed.replace(/^.*?verbetering:\s*/i, '').replace(/^.*?beter:\s*/i, '')
        if (content) feedback.improvements.push(content)
      } else if (trimmed.toLowerCase().includes('voorbeeld:')) {
        currentSection = 'example'
        feedback.example = trimmed.replace(/^.*?voorbeeld:\s*/i, '')
      } else if (trimmed.toLowerCase().includes('tegenargument:') || trimmed.toLowerCase().includes('nieuw argument:')) {
        currentSection = 'tegenargument'
        tegenargument = trimmed.replace(/^.*?tegenargument:\s*/i, '').replace(/^.*?nieuw argument:\s*/i, '')
      } else if (currentSection === 'good' && trimmed) {
        feedback.goodPoints.push(trimmed)
      } else if (currentSection === 'improvement' && trimmed) {
        feedback.improvements.push(trimmed)
      } else if (currentSection === 'example' && trimmed) {
        feedback.example += (feedback.example ? ' ' : '') + trimmed
      } else if (currentSection === 'tegenargument' && trimmed) {
        tegenargument += (tegenargument ? ' ' : '') + trimmed
      }
    }

    // Fallback parsing if structured format not found
    if (feedback.goodPoints.length === 0 && feedback.improvements.length === 0) {
      const sentences = response.split(/[.!?]+/).filter(s => s.trim())
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim()
        if (trimmed.toLowerCase().includes('goed') || trimmed.toLowerCase().includes('sterk')) {
          feedback.goodPoints.push(trimmed)
        } else if (trimmed.toLowerCase().includes('beter') || trimmed.toLowerCase().includes('verbeteren')) {
          feedback.improvements.push(trimmed)
        }
      })
    }

    return { feedback, tegenargument }
  }

  const startDebate = async () => {
    setIsLoading(true)
    setIsStarted(true)
    setMessages([])
    setLatestFeedback(null)
    
    try {
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
      
      const newSession: DebateSession = {
        stelling,
        rondeNummer: 1,
        maxRondes: 4,
        isCompleted: false,
        startTime: new Date()
      }
      setSession(newSession)

      addMessage('coach', `**Stelling:** ${stelling}

**Eerste tegenargument:** Deze maatregel zou veel te duur zijn om uit te voeren. Hoe reageer je daarop?`, {
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

    addMessage('student', currentMessage)
    const studentResponse = currentMessage
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const isLastRound = session.rondeNummer >= session.maxRondes
      
      let prompt = ''
      
      if (isLastRound) {
        prompt = `Je bent een debatcoach. De leerling heeft zojuist gereageerd op tegenargument ${session.rondeNummer} over de stelling: "${session.stelling}"

Leerling reactie: "${studentResponse}"

Dit was de laatste ronde. Geef nu een samenvatting in dit formaat:

GOED:
- [Punt 1 wat goed ging]
- [Punt 2 wat goed ging]

VERBETERING:
- [Punt 1 wat beter kan met uitleg hoe]
- [Punt 2 wat beter kan met uitleg hoe]

VOORBEELD:
"[Concreet voorbeeld hoe een argument sterker had gekund]"

REFLECTIE:
[Reflectievraag zoals "Hoe zou je dit debat anders aanpakken in een klas?"]

Houd het vriendelijk, constructief en motiverend.`
      } else {
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

Geef feedback en een nieuw tegenargument in dit exacte formaat:

GOED:
- [Wat ging goed aan dit argument]

VERBETERING:
- [Wat kan beter met uitleg hoe]

VOORBEELD:
"[Concreet voorbeeld hoe het argument sterker had gekund]"

TEGENARGUMENT:
[Nieuw tegenargument vanuit ${volgendePerspectief} perspectief - max 2 zinnen]

Houd het kort, vriendelijk en uitdagend.`
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
        // Parse final feedback
        const { feedback } = parseFeedbackResponse(data.response)
        setLatestFeedback(feedback)
        
        // Extract reflection question
        const reflectionMatch = data.response.match(/REFLECTIE:\s*(.+)/i)
        const reflectionQuestion = reflectionMatch ? reflectionMatch[1] : 'Hoe zou je dit debat anders aanpakken?'
        
        addMessage('coach', `**Debat voltooid!** 🎉\n\n**Reflectievraag:** ${reflectionQuestion}`, { 
          isReflectie: true 
        })
        
        setSession(prev => prev ? { ...prev, isCompleted: true } : null)
      } else {
        // Parse feedback and new counter-argument
        const { feedback, tegenargument } = parseFeedbackResponse(data.response)
        setLatestFeedback(feedback)
        
        // Add new counter-argument as separate message
        if (tegenargument) {
          addMessage('coach', `**Nieuw tegenargument:** ${tegenargument}`, { 
            isTegenargument: true 
          })
        }
        
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
    setLatestFeedback(null)
    if (speechControls.isSupported) {
      speechControls.stopSpeaking()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendResponse()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      speechControls.stopListening()
    } else {
      speechControls.startListening()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat Area - Left Side (2/3 width on large screens) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
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
              
              <div className="flex items-center space-x-4">
                {/* TTS Toggle */}
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    ttsEnabled ? 'bg-blue-500 text-white' : 'bg-blue-200 text-blue-600'
                  }`}
                  title={ttsEnabled ? 'Uitspraak uitschakelen' : 'Uitspraak inschakelen'}
                >
                  {ttsEnabled ? '🔊' : '🔇'}
                </button>

                {/* Progress */}
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
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                {messages.filter(msg => !msg.isFeedback || msg.isReflectie).map((message) => (
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
                          : message.isTegenargument
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-200'
                          : message.isReflectie
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {message.type === 'coach' && (
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                              <span className="text-white text-xs">🎯</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {message.isStelling ? 'Stelling & Eerste Tegenargument' :
                               message.isTegenargument ? 'Tegenargument' :
                               message.isReflectie ? 'Samenvatting & Reflectie' :
                               'Debatcoach'}
                            </span>
                          </div>
                          
                          {/* Speak button for coach messages */}
                          <button
                            onClick={() => speechControls.speakText(message.content)}
                            disabled={isSpeaking}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Bericht voorlezen"
                          >
                            {isSpeaking ? '🔊' : '🔈'}
                          </button>
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
                  <div className="relative">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isListening ? "Luisteren... spreek je argument in" : "Typ je reactie op het tegenargument..."}
                      className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                        isListening ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      rows={3}
                      disabled={isLoading || isListening}
                    />
                    
                    {/* Microphone Button */}
                    {speechControls.isSupported && (
                      <button
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
                          isListening 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                        title={isListening ? 'Stop opname' : 'Start spraakopname'}
                      >
                        {isListening ? '🔴' : '🎤'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      💡 Tip: Geef concrete voorbeelden en denk aan verschillende perspectieven
                    </div>
                    <div className="text-xs text-gray-400">
                      {speechControls.isSupported ? '🎤 Spraak • ' : ''}Enter = verzenden • Shift+Enter = nieuwe regel
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
                  Je hebt alle rondes doorlopen. Bekijk je feedback rechts!
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

          {/* Reset Button */}
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
      </div>

      {/* Feedback Panel - Right Side (1/3 width on large screens) */}
      <div className="lg:col-span-1">
        <div className="h-full">
          <FeedbackPanel 
            feedback={latestFeedback} 
            isVisible={isStarted}
          />
        </div>
      </div>
    </div>
  )
}