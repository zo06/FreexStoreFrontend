"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { ScriptForm } from '@/components/admin/script-form'
import { Script } from '@/lib/types/api.types'
import { safeAdminApi } from '@/lib/admin-api'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

function EditScript() {
  const params = useParams()
  const router = useRouter()
  const [script, setScript] = useState<Script | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [developers, setDevelopers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const scriptId = params.id as string

  useEffect(() => {
    const loadScriptEditData = async () => {
      if (!scriptId) {
        setError('Script ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Single request to get all data needed for editing
        // Returns { script, categories, developers }
        const data = await safeAdminApi.scripts.getById(scriptId)
        if (data && data.script) {
          setScript(data.script as any)
          setCategories(data.categories || [])
          setDevelopers(data.developers || [])
        } else {
          setError('Script not found')
          toast.error('Script not found')
          router.push('/admin/scripts')
        }
      } catch (error) {
        console.error('Failed to load script:', error)
        setError('Failed to load script')
        toast.error('Failed to load script')
        router.push('/admin/scripts')
      } finally {
        setLoading(false)
      }
    }

    loadScriptEditData()
  }, [scriptId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-white">Loading script...</p>
        </div>
      </div>
    )
  }

  if (error || !script) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Script not found'}</p>
          <button
            onClick={() => router.push('/admin/scripts')}
            className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105 px-4 py-2 rounded-lg"
          >
            Back to Scripts
          </button>
        </div>
      </div>
    )
  }

  return (
    <ScriptForm 
      mode="edit" 
      script={script} 
      categories={categories}
      developers={developers}
    />
  )
}

export default withAdminAuth(EditScript)