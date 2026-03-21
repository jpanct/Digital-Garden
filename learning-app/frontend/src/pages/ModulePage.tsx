import { useState, useEffect, useCallback, type ComponentType } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Loader2, BookOpen, FileText, HelpCircle, Zap } from 'lucide-react'
import axios from 'axios'
import { usePlanStore } from '../store/planStore'
import { useUserStore } from '../store/userStore'
import { plansApi } from '../api/plans'
import { resourcesApi } from '../api/resources'
import { notesApi } from '../api/notes'
import { quizApi } from '../api/quiz'
import { Resource, Note, Quiz, MilestoneUpdateResponse, LearningPlan, Module } from '../types'
import MilestoneItem from '../components/plan/MilestoneItem'
import ProgressBar from '../components/plan/ProgressBar'
import ResourceList from '../components/resources/ResourceList'
import NoteEditor from '../components/notes/NoteEditor'
import QuizModal from '../components/quiz/QuizModal'
import clsx from 'clsx'

type TabId = 'resources' | 'notes' | 'quiz'

const tabs: { id: TabId; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
]

export default function ModulePage() {
  const { planId, moduleId } = useParams<{ planId: string; moduleId: string }>()
  const { plan, setPlan, updateMilestone } = usePlanStore()
  const { user } = useUserStore()

  const [activeTab, setActiveTab] = useState<TabId>('resources')
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | undefined>(undefined)

  // Resources state
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)

  // Notes state
  const [note, setNote] = useState<Note | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [notesLoaded, setNotesLoaded] = useState(false)

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizLoaded, setQuizLoaded] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)

  const numericPlanId = planId ? parseInt(planId, 10) : null

  // Load plan if needed
  useEffect(() => {
    if (!numericPlanId) return
    if (plan?.id === numericPlanId) return
    const fetchPlan = async () => {
      try {
        const response = await plansApi.getPlan(numericPlanId)
        setPlan(response.data as LearningPlan)
      } catch {
        // silently fail
      }
    }
    fetchPlan()
  }, [numericPlanId, plan?.id, setPlan])

  const currentModule: Module | undefined = plan?.plan_data.modules.find((m) => m.id === moduleId)

  // Load resources when tab becomes active
  useEffect(() => {
    if (activeTab !== 'resources' || resourcesLoaded || !numericPlanId || !moduleId) return
    const fetchResources = async () => {
      setResourcesLoading(true)
      try {
        const response = await resourcesApi.getResources(numericPlanId, moduleId)
        setResources(response.data as Resource[])
      } catch {
        setResources([])
      } finally {
        setResourcesLoading(false)
        setResourcesLoaded(true)
      }
    }
    fetchResources()
  }, [activeTab, resourcesLoaded, numericPlanId, moduleId])

  // Load notes when tab becomes active
  useEffect(() => {
    if (activeTab !== 'notes' || notesLoaded || !numericPlanId || !moduleId || !user) return
    const fetchNotes = async () => {
      setNoteLoading(true)
      try {
        const response = await notesApi.getNotes(numericPlanId, moduleId, user.id)
        const notes = response.data as Note[]
        if (notes.length > 0) setNote(notes[0])
      } catch {
        // no notes yet
      } finally {
        setNoteLoading(false)
        setNotesLoaded(true)
      }
    }
    fetchNotes()
  }, [activeTab, notesLoaded, numericPlanId, moduleId, user])

  // Load quiz when tab becomes active
  useEffect(() => {
    if (activeTab !== 'quiz' || quizLoaded || !numericPlanId || !moduleId) return
    const fetchQuiz = async () => {
      setQuizLoading(true)
      try {
        const response = await quizApi.getQuiz(numericPlanId, moduleId)
        setQuiz(response.data as Quiz)
      } catch {
        // no quiz yet
      } finally {
        setQuizLoading(false)
        setQuizLoaded(true)
      }
    }
    fetchQuiz()
  }, [activeTab, quizLoaded, numericPlanId, moduleId])

  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    if (!numericPlanId) return
    setLoadingMilestoneId(milestoneId)
    try {
      const response = await plansApi.updateMilestone(numericPlanId, milestoneId, completed)
      updateMilestone(milestoneId, completed, response.data as MilestoneUpdateResponse)
    } catch {
      // revert on error
    } finally {
      setLoadingMilestoneId(undefined)
    }
  }

  const handleNoteSave = useCallback(async (html: string, text: string) => {
    if (!numericPlanId || !moduleId || !user) return
    try {
      if (note) {
        const response = await notesApi.updateNote(note.id, html, text)
        setNote(response.data as Note)
      } else {
        const response = await notesApi.createNote(numericPlanId, moduleId, user.id, html, text)
        setNote(response.data as Note)
      }
    } catch {
      // silently fail - editor shows saved state optimistically
    }
  }, [note, numericPlanId, moduleId, user])

  const handleGenerateQuiz = async () => {
    if (!numericPlanId || !moduleId) return
    setGeneratingQuiz(true)
    try {
      const response = await quizApi.generateQuiz(numericPlanId, moduleId)
      setQuiz(response.data as Quiz)
    } catch (err: unknown) {
      console.error('Failed to generate quiz', err)
    } finally {
      setGeneratingQuiz(false)
    }
  }

  if (!currentModule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-garden-500 animate-spin" />
      </div>
    )
  }

  const completedCount = currentModule.milestones.filter((m) => m.completed).length
  const totalCount = currentModule.milestones.length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        {plan && (
          <>
            <Link to={`/plan/${plan.id}`} className="hover:text-garden-600 transition-colors">
              {plan.plan_data.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-gray-800 font-medium">{currentModule.title}</span>
      </nav>

      {/* Module header */}
      <div className="bg-white rounded-2xl border border-garden-100 p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentModule.title}</h1>
        <p className="text-gray-600 mb-4">{currentModule.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500">
            {completedCount}/{totalCount} milestones completed
          </span>
        </div>

        <ProgressBar value={completedCount} max={totalCount} />
      </div>

      {/* Milestones section */}
      <div className="bg-white rounded-2xl border border-garden-100 p-5 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-garden-600" />
          Milestones
        </h2>
        <div className="space-y-1">
          {currentModule.milestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              onToggle={handleMilestoneToggle}
              isLoading={loadingMilestoneId === milestone.id}
            />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-garden-100 shadow-sm overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
                  activeTab === tab.id
                    ? 'text-garden-700 border-b-2 border-garden-600 bg-garden-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {/* Resources tab */}
          {activeTab === 'resources' && (
            <ResourceList resources={resources} isLoading={resourcesLoading} />
          )}

          {/* Notes tab */}
          {activeTab === 'notes' && (
            <div>
              {noteLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-garden-500 animate-spin" />
                </div>
              ) : (
                <NoteEditor
                  content={note?.content_html || ''}
                  onSave={handleNoteSave}
                />
              )}
            </div>
          )}

          {/* Quiz tab */}
          {activeTab === 'quiz' && (
            <div>
              {quizLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-garden-500 animate-spin" />
                </div>
              ) : quiz ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Module Quiz</h3>
                      <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
                    </div>
                    <button
                      onClick={() => setShowQuizModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-garden-600 text-white rounded-lg text-sm font-medium hover:bg-garden-700 transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      Take Quiz
                    </button>
                  </div>

                  <div className="space-y-3">
                    {quiz.questions.map((q, idx) => (
                      <div key={q.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-800">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="text-xs text-gray-500 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-2">No quiz yet</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Generate a quiz to test your knowledge of this module.
                  </p>
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-garden-600 text-white rounded-xl font-medium hover:bg-garden-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {generatingQuiz ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Quiz
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quiz modal */}
      {showQuizModal && quiz && user && (
        <QuizModal
          quiz={quiz}
          userId={user.id}
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </div>
  )
}
