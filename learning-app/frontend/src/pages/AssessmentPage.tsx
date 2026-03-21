import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, Sprout } from 'lucide-react'
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
        {message.content}
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
    return (
      <div className="min-h-screen bg-garden-50 flex flex-col items-center justify-center gap-6">
        <div className="bg-garden-600 text-white rounded-full p-6">
          <Sprout className="w-12 h-12 animate-float" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-garden-800 mb-2">Building your learning plan...</h2>
          <p className="text-gray-600">Personalizing your journey based on your assessment</p>
        </div>
        <Loader2 className="w-8 h-8 text-garden-600 animate-spin" />
      </div>
    )
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
