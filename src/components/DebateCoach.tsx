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
  selectedLevel: string
  customTopic: string
}

export default function DebateCoach() {
  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<DebateSession | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null)
  
  // Configuration states
  const [showConfigScreen, setShowConfigScreen] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('6 vwo')
  const [customTopic, setCustomTopic] = useState('')
  
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
    setShowConfigScreen(false)
    setIsStarted(true)
    setMessages([])
    setLatestFeedback(null)
    
    try {
      let prompt = ''
      
      if (customTopic.trim()) {
        prompt = `Genereer een actuele, maatschappelijk relevante debat-stelling voor leerlingen van ${selectedLevel} over het onderwerp "${customTopic}". 

De stelling moet:
- Geschikt zijn voor het niveau ${selectedLevel}
- Controversieel genoeg voor een goed debat
- Begrijpelijk en relevant voor leerlingen van dit niveau
- Gebaseerd zijn op het onderwerp "${customTopic}"
- Actueel zijn (2024/2025)

Geef alleen de stelling terug, geen uitleg. Begin met "Stelling:" en geef dan één heldere zin.

Genereer nu een stelling over "${customTopic}" voor ${selectedLevel}:`
      } else {
        prompt = `Genereer een actuele, maatschappelijk relevante debat-stelling voor leerlingen van ${selectedLevel}. De stelling moet:
- Geschikt zijn voor het niveau ${selectedLevel}
- Actueel zijn (2024/2025)
- Controversieel genoeg voor een goed debat
- Begrijpelijk en relevant voor leerlingen van dit niveau
- Relevant voor hun leefwereld

Geef alleen de stelling terug, geen uitleg. Begin met "Stelling:" en geef dan één heldere zin.

Voorbeelden van goede stellingen voor ${selectedLevel}:
- TikTok zou verboden moeten worden voor jongeren onder de 16
- Scholen moeten AI-tools zoals ChatGPT volledig verbieden
- Nederland moet een vierdaagse werkweek invoeren

Genereer nu een nieuwe, actuele stelling voor ${selectedLevel}:`
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
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
        startTime: new Date(),
        selectedLevel,
        customTopic: customTopic.trim()
      }
      setSession(newSession)

      // Generate first counter-argument appropriate for the level
      const levelPrompt = `Je bent een debatcoach voor ${selectedLevel} leerlingen. De stelling is: "${stelling}"

Geef een eerste tegenargument dat geschikt is voor het niveau ${selectedLevel}. Het tegenargument moet:
- Begrijpelijk zijn voor ${selectedLevel} leerlingen
- Uitdagend maar niet te complex
- Economisch perspectief gebruiken (kosten, geld, banen)
- Maximum 2 zinnen

Geef alleen het tegenargument, geen uitleg.`

      const counterResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: levelPrompt,
          aiModel: 'smart'
        }),
      })

      if (counterResponse.ok) {
        const counterData = await counterResponse.json()
        const tegenargument = counterData.response.trim()
        
        addMessage('coach', `**Stelling:** ${stelling}

**Eerste tegenargument:** ${tegenargument}

Hoe reageer je daarop?`, {
          isStelling: true,
          isTegenargument: true
      } else {
        addMessage('coach', `**Stelling:** ${stelling}

**Eerste tegenargument:** Deze maatregel zou veel te duur zijn om uit te voeren. Hoe reageer je daarop?`, {
          isTegenargument: true
        })
      }

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
        prompt = `Je bent een debatcoach voor ${session.selectedLevel} leerlingen. De leerling heeft zojuist gereageerd op tegenargument ${session.rondeNummer} over de stelling: "${session.stelling}"

Leerling reactie: "${studentResponse}"

Dit was de laatste ronde. Geef nu een samenvatting in dit formaat, geschikt voor ${session.selectedLevel} niveau:

GOED:
- [Punt 1 wat goed ging]
- [Punt 2 wat goed ging]

VERBETERING:
- [Punt 1 wat beter kan met uitleg hoe]
- [Punt 2 wat beter kan met uitleg hoe]

VOORBEELD:
"[Concreet voorbeeld hoe een argument sterker had gekund]"

REFLECTIE:
[Reflectievraag passend bij ${session.selectedLevel} niveau]

Houd het vriendelijk, constructief en motiverend voor ${session.selectedLevel} leerlingen.`
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
        
        prompt = `Je bent een debatcoach voor ${session.selectedLevel} leerlingen. De leerling reageert op tegenargument ${session.rondeNummer} over de stelling: "${session.stelling}"

Leerling reactie: "${studentResponse}"

Geef feedback en een nieuw tegenargument in dit exacte formaat, geschikt voor ${session.selectedLevel} niveau:

GOED:
- [Wat ging goed aan dit argument]

VERBETERING:
- [Wat kan beter met uitleg hoe]

VOORBEELD:
"[Concreet voorbeeld hoe het argument sterker had gekund]"

TEGENARGUMENT:
[Nieuw tegenargument vanuit ${volgendePerspectief} perspectief - max 2 zinnen, geschikt voor ${session.selectedLevel}]

Houd het kort, vriendelijk en uitdagend voor ${session.selectedLevel} leerlingen.`
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
    setShowConfigScreen(true)
    setCurrentMessage('')
    setLatestFeedback(null)
    setCustomTopic('')
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
      {/* Chat Area - Left Side (2/3 width on large screens) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Debattraining</h2>
                {session && (
                  <div className="mt-3">
                    <div className="text-blue-100 text-sm mb-2">
                      <span className="font-medium">Niveau:</span> {session.selectedLevel}
                      {session.customTopic && (
                        <span className="ml-3">
                          <span className="font-medium">Onderwerp:</span> {session.customTopic}
                        </span>
                      )}
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 border border-white border-opacity-30">
                      <div className="text-xs font-medium text-blue-100 mb-1">STELLING:</div>
                      <div className="text-white font-semibold text-base leading-relaxed">
                        {session.stelling}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* TTS Toggle */}
                {isStarted && (
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      ttsEnabled ? 'bg-blue-500 text-white' : 'bg-blue-200 text-blue-600'
                    }`}
                    title={ttsEnabled ? 'Uitspraak uitschakelen' : 'Uitspraak inschakelen'}
                  >
                    {ttsEnabled ? '🔊' : '🔇'}
                  </button>
                )}

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

                {/* Reset Button */}
                {isStarted && (
                  <button
                    onClick={resetDebate}
                    className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm"
                    title="Nieuw debat starten"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Screen */}
          {showConfigScreen && (
            <div className="p-8 min-h-[500px]">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Debat Configuratie
                  </h3>
                  <p className="text-gray-600">
                    Stel je debattraining in naar jouw niveau en interesse
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Niveau Selectie */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📚 Op welk niveau wil je debatteren?
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="3 havo">3 HAVO</option>
                      <option value="4 havo">4 HAVO</option>
                      <option value="5 havo">5 HAVO</option>
                      <option value="4 vwo">4 VWO</option>
                      <option value="5 vwo">5 VWO</option>
                      <option value="6 vwo">6 VWO</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Het niveau bepaalt de complexiteit van de argumenten en taalgebruik
                    </p>
                  </div>

                  {/* Onderwerp Keuze */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🎯 Onderwerp (optioneel)
                    </label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Bijv: klimaatverandering, sociale media, onderwijs..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laat leeg voor een actueel onderwerp gekozen door de AI
                    </p>
                  </div>

                  {/* Voorbeelden */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      💡 Populaire onderwerpen:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Klimaatverandering',
                        'Sociale media',
                        'Kunstmatige intelligentie',
                        'Onderwijs',
                        'Gezondheidszorg',
                        'Milieu',
                        'Technologie',
                        'Politiek'
                      ].map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setCustomTopic(topic.toLowerCase())}
                          className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={startDebate}
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Stelling wordt gegenereerd...
                      </div>
                    ) : (
                      '🚀 Start Debattraining'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          {isStarted && !showConfigScreen && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
              {messages.filter(msg => !msg.isFeedback || msg.isReflectie).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.type === 'student'
                        ? 'bg-blue-600 text-white'
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
                            {message.isTegenargument ? 'Tegenargument' :
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
            </div>
          )}

          {/* Input Area */}
          {isStarted && !showConfigScreen && session && !session.isCompleted && (
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
        </div>
      </div>

      {/* Feedback Panel - Right Side (1/3 width on large screens) */}
      <div className="lg:col-span-1">
        <div className="h-full">
          <FeedbackPanel 
            feedback={latestFeedback} 
            isVisible={isStarted && !showConfigScreen}
          />
        </div>
      </div>
    </div>
  )
}