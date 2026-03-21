import { useState, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useUserStore } from '../store/userStore'
import { useAssessmentStore } from '../store/assessmentStore'
import { assessmentApi } from '../api/assessment'
import client from '../api/client'
import GardenCanvas from '../components/garden/GardenCanvas'
import { User } from '../types'

const EXAMPLE_SKILLS = [
  'Python programming',
  'Guitar',
  'Watercolor painting',
  'Chess',
  'Spanish',
  'Machine Learning',
  'Photography',
  'Cooking',
  'Yoga',
  'Public Speaking',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, setUser, clearUser } = useUserStore()
  const { setSession, addMessage, clearAssessment } = useAssessmentStore()

  const [username, setUsername] = useState('')
  const [skill, setSkill] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    if (!skill.trim()) {
      setError('Please enter a skill to learn')
      return
    }
    if (!user && !username.trim()) {
      setError('Please enter your name to get started')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let currentUser = user

      if (!currentUser) {
        const response = await client.post<User>('/users', { username: username.trim() })
        currentUser = response.data
        setUser(currentUser)
      }

      clearAssessment()
      const assessmentResponse = await assessmentApi.start(skill.trim(), currentUser.id)
      const data = assessmentResponse.data as { session_id: number; message: string; question_number: number }
      setSession(data.session_id, skill.trim())
      addMessage({ id: Date.now(), role: 'assistant', content: data.message, created_at: new Date().toISOString() })

      navigate(`/assessment/${data.session_id}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleStart()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-50 to-garden-100 flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-garden-600 text-white rounded-2xl p-3">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-garden-900">Digital Garden</h1>
        </div>

        {/* Main heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight max-w-2xl">
          What do you want to{' '}
          <span className="text-garden-600">learn</span>?
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
          Enter any skill and we'll assess your level, build a personalized plan, and find the best resources for you.
        </p>

        {/* Input card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md border border-garden-100">
          {/* Username input (if not logged in) */}
          {!user && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Your name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-garden-400 focus:border-transparent transition"
              />
            </div>
          )}

          {user && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Welcome back, <strong>{user.username}</strong>!
              </span>
              <button
                onClick={() => {
                  clearUser()
                }}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Switch user
              </button>
            </div>
          )}

          {/* Skill input */}
          <div className="mb-4">
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1.5">
              Skill to learn
            </label>
            <input
              id="skill"
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Python, Guitar, Watercolor painting, Chess..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-garden-400 focus:border-transparent transition"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-garden-600 text-white rounded-xl font-semibold text-base hover:bg-garden-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting assessment...
              </>
            ) : (
              <>
                Start Learning
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Example skills */}
        <div className="mt-8 max-w-lg">
          <p className="text-sm text-gray-500 mb-3">Popular skills to learn:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_SKILLS.map((s) => (
              <button
                key={s}
                onClick={() => setSkill(s)}
                className="px-3 py-1.5 bg-white border border-garden-200 text-garden-700 rounded-full text-sm hover:bg-garden-50 hover:border-garden-400 transition-colors cursor-pointer shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative garden */}
      <div className="flex justify-center pb-4 px-4">
        <GardenCanvas stage={4} className="w-full max-w-md h-48 opacity-80" />
      </div>
    </div>
  )
}
