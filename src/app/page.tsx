import DebateCoach from '@/components/DebateCoach'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.542l-3.677 1.342a.5.5 0 01-.644-.644l1.342-3.677A8.13 8.13 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Debatcoach AI
          </h1>
          
          <p className="text-lg text-blue-700 font-medium mb-2">
            Train je debatvaardigheden met kritische tegenargumenten
          </p>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ik ben je digitale debatcoach. Ik geef je stellingen en tegenargumenten waar je op moet reageren. 
            Zo leer je beter argumenteren en kritisch denken!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <DebateCoach />
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 text-blue-600">
            <span>🎯</span>
            <span>Veel succes met debatteren!</span>
            <span>🎯</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Debatcoach AI • Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  )
}