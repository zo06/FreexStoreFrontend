"use client"

import { withAdminAuth } from '@/lib/auth-context'
import { ScriptForm } from '@/components/admin/script-form'

function CreateScript() {
  return (
    <ScriptForm mode="create" />
  )
}

export default withAdminAuth(CreateScript)
