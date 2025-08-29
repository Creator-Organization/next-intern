/**
 * User Type Selector Component
 * NextIntern - Authentication System
 */

'use client'

import { UserType } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, Building2 } from 'lucide-react'

interface UserTypeSelectorProps {
  selectedType: UserType | null
  onSelect: (type: UserType) => void
  className?: string
}

const userTypeOptions = [
  {
    value: UserType.STUDENT,
    label: 'Student',
    description: 'Looking for internship opportunities',
    icon: GraduationCap,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-200'
  },
  {
    value: UserType.COMPANY,
    label: 'Company',
    description: 'Hiring interns and talent',
    icon: Building2,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-50 hover:border-green-200'
  }
]

export function UserTypeSelector({ selectedType, onSelect, className = '' }: UserTypeSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Account Type</h3>
        <p className="text-sm text-gray-600">Select the option that best describes you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedType === option.value
          
          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-md scale-105' 
                  : `border-gray-200 ${option.hoverColor}`
              }`}
              onClick={() => onSelect(option.value)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-primary-500' : option.color
                }`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h4 className={`text-lg font-semibold mb-2 ${
                  isSelected ? 'text-primary-700' : 'text-gray-900'
                }`}>
                  {option.label}
                </h4>
                
                <p className={`text-sm ${
                  isSelected ? 'text-primary-600' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
                
                {isSelected && (
                  <div className="mt-3 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-xs font-medium text-primary-600">Selected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}