interface FeedbackData {
  goodPoints: string[]
  improvements: string[]
  example: string
  rondeNummer: number
}

interface FeedbackPanelProps {
  feedback: FeedbackData | null
  isVisible: boolean
}

export default function FeedbackPanel({ feedback, isVisible }: FeedbackPanelProps) {
  if (!isVisible || !feedback) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.542l-3.677 1.342a.5.5 0 01-.644-.644l1.342-3.677A8.13 8.13 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Feedback verschijnt hier
          </h3>
          <p className="text-gray-500 text-sm">
            Reageer op een tegenargument om feedback te ontvangen
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-green-600 text-sm">📝</span>
          </span>
          Feedback Ronde {feedback.rondeNummer}
        </h3>
      </div>

      {/* Goede Punten */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-green-700 mb-3 flex items-center">
          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-green-600 text-xs">✓</span>
          </span>
          Wat ging goed
        </h4>
        <div className="space-y-2">
          {feedback.goodPoints.map((point, index) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verbeterpunten */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-orange-700 mb-3 flex items-center">
          <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-orange-600 text-xs">⚡</span>
          </span>
          Kan beter
        </h4>
        <div className="space-y-2">
          {feedback.improvements.map((improvement, index) => (
            <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 text-sm">{improvement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voorbeeld */}
      {feedback.example && (
        <div className="mb-4">
          <h4 className="text-md font-semibold text-blue-700 mb-3 flex items-center">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-600 text-xs">💡</span>
            </span>
            Voorbeeld verbetering
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm italic">"{feedback.example}"</p>
          </div>
        </div>
      )}
    </div>
  )
}