'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare, Send, X, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface Conversation {
  id: string
  candidateId: string
  candidateName: string
  role: string
  lastMessage: string
  lastMessageTime: string
  isOnline: boolean
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  senderType: 'INDUSTRY' | 'CANDIDATE'
  timestamp: Date
  isRead: boolean
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const selectedCandidateFromUrl = searchParams.get('candidate')
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(selectedCandidateFromUrl)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading conversations
    setTimeout(() => {
      setConversations([
        {
          id: '1',
          candidateId: 'cand1',
          candidateName: 'Candidate 1',
          role: 'Full Stack Developer Intern',
          lastMessage: 'I can share the GitHub links if you would like.',
          lastMessageTime: '30 minutes ago',
          isOnline: true,
          unreadCount: 2
        },
        {
          id: '2',
          candidateId: 'cand2',
          candidateName: 'Candidate 2',
          role: 'AI/ML Research Assistant',
          lastMessage: 'Thank you for considering my application.',
          lastMessageTime: '2 hours ago',
          isOnline: false,
          unreadCount: 0
        },
        {
          id: '3',
          candidateId: 'cand3',
          candidateName: 'Candidate 3',
          role: 'Mobile App Developer',
          lastMessage: 'Yes, I am available for the interview.',
          lastMessageTime: '1 day ago',
          isOnline: true,
          unreadCount: 1
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      // Mock messages - replace with API call
      setMessages([
        {
          id: '1',
          content: 'Hi! I am very interested in the Full Stack Developer position. I have experience with React and Node.js.',
          senderId: 'cand1',
          senderType: 'CANDIDATE',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: '2',
          content: 'Hello! Thank you for your interest. Could you share some of your recent projects?',
          senderId: 'industry1',
          senderType: 'INDUSTRY',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: '3',
          content: 'I have built an e-commerce platform and a task management app. I can share the GitHub links if you would like.',
          senderId: 'cand1',
          senderType: 'CANDIDATE',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: true
        },
        {
          id: '4',
          content: 'That sounds great! Please share your GitHub profile. Also, are you available for a quick technical discussion this week?',
          senderId: 'industry1',
          senderType: 'INDUSTRY',
          timestamp: new Date(),
          isRead: false
        }
      ])
    }
  }, [selectedConversation])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      senderId: 'industry1',
      senderType: 'INDUSTRY',
      timestamp: new Date(),
      isRead: false
    }

    setMessages(prev => [...prev, newMessage])
    setMessageInput('')

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: messageInput, lastMessageTime: 'Just now' }
          : conv
      )
    )
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return timestamp.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-manrope">Student Communications</h2>
        <p className="text-gray-600">Secure messaging with interested students through our platform</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="space-y-2">
              <h3 className="font-semibold">Active Conversations</h3>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-teal-700">
                          {conversation.candidateName.charAt(0)}
                        </span>
                      </div>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{conversation.candidateName}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conversation.role}</p>
                      <p className="text-xs text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-400">{conversation.lastMessageTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedConversation && selectedConversationData ? (
                <div className="border border-teal-100 rounded-lg bg-white">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-teal-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-teal-700">
                              {selectedConversationData.candidateName.charAt(0)}
                            </span>
                          </div>
                          {selectedConversationData.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{selectedConversationData.candidateName}</p>
                          <p className="text-xs text-gray-500">
                            {selectedConversationData.isOnline ? 'Online now' : 'Last seen 2 hours ago'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 space-y-4 h-64 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'INDUSTRY' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.senderType === 'INDUSTRY'
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p 
                            className={`text-xs mt-1 ${
                              message.senderType === 'INDUSTRY' 
                                ? 'text-teal-100' 
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-teal-100">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-teal-600 to-green-600"
                        disabled={!messageInput.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-teal-100 rounded-lg bg-white p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 bg-teal-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-teal-700">
              <Shield className="h-4 w-4" />
              <span>
                <strong>Privacy Notice:</strong> All communications must occur through the NextIntern 
                platform. Direct contact outside this platform is prohibited to ensure student privacy and 
                security.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}