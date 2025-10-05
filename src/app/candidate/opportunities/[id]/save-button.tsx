'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'

interface SaveOpportunityButtonProps {
  opportunityId: string
  candidateId: string
  initialSaved: boolean
}

export function SaveOpportunityButton({ 
  opportunityId, 
  candidateId, 
  initialSaved 
}: SaveOpportunityButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleSave = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/candidates/saved', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, candidateId })
      })

      if (response.ok) {
        setIsSaved(!isSaved)
      }
    } catch (error) {
      console.error('Failed to toggle save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full mt-4"
      onClick={handleToggleSave}
      disabled={isLoading}
    >
      <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
      {isSaved ? 'Saved' : 'Save for Later'}
    </Button>
  )
}