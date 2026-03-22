import { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useAssessmentStore } from '../store/assessmentStore'
import { usePlanStore } from '../store/planStore'
import { assessmentApi } from '../api/assessment'
import { AssessmentMessage, AssessmentSession, LearningPlan } from '../types'
import clsx from 'clsx'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm max-w-xs">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

function ChatBubble({ message }: { message: AssessmentMessage }) {
  const isAssistant = message.role === 'assistant'
  return (
    <div className={clsx('flex', isAssistant ? 'justify-start' : 'justify-end')}>
      <div className={clsx(
        'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
        isAssistant
          ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
          : 'bg-garden-600 text-white rounded-br-sm'
      )}>
        {renderBold(message.content)}
      </div>
    </div>
  )
}

const STEPS = [
  'Analysing your responses...',
  'Determining your level...',
  'Designing your learning path...',
  'Planting your seed...',
  'Growing your plan...',
]

function PlanBuildingScreen() {
  const [stepIndex, setStepIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const advance = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setStepIndex((i) => (i + 1) % STEPS.length)
      setVisible(true)
    }, 400)
  }, [])

  useEffect(() => {
    const id = setInterval(advance, 2200)
    return () => clearInterval(id)
  }, [advance])

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-50 to-garden-100 flex flex-col items-center justify-center gap-10 px-4">
      {/* Animated garden SVG */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <style>{`
            @keyframes grow-stem {
              0%   { transform: scaleY(0); transform-origin: bottom; }
              100% { transform: scaleY(1); transform-origin: bottom; }
            }
            @keyframes pop-leaf {
              0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
              60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes sway {
              0%, 100% { transform: rotate(-3deg); }
              50%       { transform: rotate(3deg); }
            }
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.4; r: 28px; }
              50%       { opacity: 0.8; r: 34px; }
            }
            .stem      { animation: grow-stem 1.2s cubic-bezier(.4,0,.2,1) forwards; }
            .leaf-l    { transform-origin: 96px 120px; animation: pop-leaf 0.6s 1s cubic-bezier(.4,0,.2,1) both, sway 3s 1.6s ease-in-out infinite; }
            .leaf-r    { transform-origin: 104px 100px; animation: pop-leaf 0.6s 1.4s cubic-bezier(.4,0,.2,1) both, sway 3s 2s ease-in-out infinite reverse; }
            .leaf-top  { transform-origin: 100px 80px; animation: pop-leaf 0.6s 1.8s cubic-bezier(.4,0,.2,1) both; }
            .glow      { animation: pulse-glow 2s ease-in-out infinite; }
          `}</style>

          {/* Glowing ground circle */}
          <circle className="glow" cx="100" cy="160" r="28" fill="#bbf7d0" />

          {/* Soil */}
          <ellipse cx="100" cy="162" rx="38" ry="11" fill="#92400e" opacity="0.55" />

          {/* Stem */}
          <g className="stem">
            <line x1="100" y1="158" x2="100" y2="82" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Left leaf */}
          <g className="leaf-l">
            <ellipse cx="80" cy="120" rx="20" ry="10" fill="#22c55e" transform="rotate(-35 80 120)" />
            <line x1="96" y1="122" x2="72" y2="114" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Right leaf */}
          <g className="leaf-r">
            <ellipse cx="120" cy="100" rx="20" ry="10" fill="#4ade80" transform="rotate(35 120 100)" />
            <line x1="104" y1="102" x2="128" y2="94" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Top bud */}
          <g className="leaf-top">
            <ellipse cx="100" cy="76" rx="10" ry="16" fill="#86efac" />
            <ellipse cx="100" cy="70" rx="6" ry="10" fill="#bbf7d0" opacity="0.7" />
          </g>

          {/* Sparkles */}
          <circle cx="140" cy="90" r="3" fill="#fbbf24" opacity="0" style={{ animation: 'pop-leaf 0.5s 2.2s both' }} />
          <circle cx="58"  cy="105" r="2" fill="#fbbf24" opacity="0" style={{ animation: 'pop-leaf 0.5s 2.5s both' }} />
          <circle cx="148" cy="130" r="2" fill="#86efac" opacity="0" style={{ animation: 'pop-leaf 0.5s 2.8s both' }} />
        </svg>
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-garden-800 mb-3">Building your garden</h2>
        <p
          className="text-garden-600 font-medium text-base transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {STEPS[stepIndex]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-56 h-1.5 bg-garden-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-garden-500 rounded-full"
          style={{
            width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { skill, messages, isLoading, setSession, addMessage, setLoading } = useAssessmentStore()
  const { setPlan } = usePlanStore()

  const [input, setInput] = useState('')
  const [questionCount, setQuestionCount] = useState(1)
  const [buildingPlan, setBuildingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const numericSessionId = sessionId ? parseInt(sessionId, 10) : null

  // Load session on mount if messages are empty
  useEffect(() => {
    if (!numericSessionId) return
    if (messages.length === 0) {
      const loadSession = async () => {
        try {
          setLoading(true)
          const response = await assessmentApi.getSession(numericSessionId)
          const session = response.data as AssessmentSession
          setSession(session.id, session.skill)
          session.messages.forEach((msg) => addMessage(msg))
        } catch {
          setError('Failed to load assessment session')
        } finally {
          setLoading(false)
        }
      }
      loadSession()
    }
  }, [numericSessionId, messages.length, setSession, addMessage, setLoading])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !numericSessionId || buildingPlan) return

    const userMessage: AssessmentMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }
    addMessage(userMessage)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await assessmentApi.respond(numericSessionId, userMessage.content)
      const data = response.data as {
        done: boolean;
        message?: string;
        level?: string;
        plan_id?: number;
      }

      if (!data.done && data.message) {
        const assistantMessage: AssessmentMessage = {
          id: Date.now(),
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString(),
        }
        addMessage(assistantMessage)
        setQuestionCount((prev) => prev + 1)
      }

      if (data.done && data.plan_id) {
        setBuildingPlan(true)
        setTimeout(() => {
          navigate(`/plan/${data.plan_id}`)
        }, 1500)
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to send message')
      } else {
        setError('Failed to send message')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (buildingPlan) {
    return <PlanBuildingScreen />
  }

  return (
    <div className="min-h-screen bg-garden-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-garden-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-800">
              Assessing your <span className="text-garden-600">{skill || 'knowledge'}</span>
            </h1>
            <p className="text-xs text-gray-500">Question {questionCount} of ~7</p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'w-2 h-2 rounded-full transition-colors',
                  i < questionCount ? 'bg-garden-500' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <TypingDots />
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg inline-block">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-garden-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            disabled={isLoading || buildingPlan}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-garden-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || buildingPlan}
            className="p-2.5 bg-garden-600 text-white rounded-xl hover:bg-garden-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
