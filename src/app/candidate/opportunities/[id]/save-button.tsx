'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast'; // ✅ Add toast import

interface SaveOpportunityButtonProps {
  opportunityId: string;
  candidateId: string;
  initialSaved: boolean;
}

export function SaveOpportunityButton({
  opportunityId,
  candidateId,
  initialSaved,
}: SaveOpportunityButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async () => {
    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `/api/candidates/${candidateId}/saved?opportunityId=${opportunityId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          setIsSaved(false);
          toast.success('Removed from saved opportunities'); // ✅ Toast
          console.log('✅ Opportunity unsaved');
        } else {
          toast.error('Failed to remove opportunity'); // ✅ Toast
          console.error('Failed to unsave');
        }
      } else {
        // Save
        const response = await fetch(`/api/candidates/${candidateId}/saved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityId }),
        });

        if (response.ok) {
          setIsSaved(true);
          toast.success('Added to saved opportunities'); // ✅ Toast
          console.log('✅ Opportunity saved');
        } else {
          toast.error('Failed to save opportunity'); // ✅ Toast
          console.error('Failed to save');
        }
      }
    } catch (error) {
      console.error('Save/unsave error:', error);
      toast.error('An error occurred'); // ✅ Toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className="mt-3 w-full"
      onClick={handleToggleSave}
      disabled={isLoading}
    >
      <Bookmark
        className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current text-primary-600' : ''}`}
      />
      {isLoading
        ? 'Saving...'
        : isSaved
          ? 'Saved'
          : 'Save for Later'}
    </Button>
  );
}