/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/ui/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Search,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  subject: string | null;
  content: string;
  isRead: boolean;
  readAt: Date | null;
  sentAt: Date;
  isOutgoing: boolean;
  senderType: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userType: string;
  companyName?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isVerified: boolean;
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get conversation from URL
  const conversationUserId = searchParams.get('conversation');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchConversations();
  }, [status]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Auto-select conversation from URL if exists
    if (conversationUserId && conversations.length > 0) {
      const conv = conversations.find((c) => c.userId === conversationUserId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [conversationUserId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    if (status !== 'authenticated') return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      } else {
        toast.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Error loading conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Error loading messages');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchConversations();
    if (selectedConversation) {
      await fetchMessages(selectedConversation.userId);
    }
    setIsRefreshing(false);
    toast.success('Refreshed!');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConversation.userId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // ✅ FIX: Create proper message object with correct types
        const newMsg: Message = {
          id: data.data.id,
          senderId: session!.user!.id,
          receiverId: selectedConversation.userId,
          senderName: 'You',
          subject: data.data.subject || null,
          content: newMessage.trim(),
          isRead: false,
          readAt: undefined, // ✅ Changed from null to undefined
          sentAt: new Date(),
          isOutgoing: true,
          senderType: 'INDUSTRY',
        };

        // ✅ Add message immediately to state
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage('');

        // ✅ Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);

        // ✅ Update conversation list in background
        fetchConversations();

        toast.success('Message sent!');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? 'numeric'
            : undefined,
      });
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-manrope text-2xl font-bold text-gray-900">
              Messages
            </h1>
            <p className="text-gray-600">
              Communicate with candidates about opportunities
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="secondary"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Privacy Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">
                  Platform Communication Only
                </h3>
                <p className="text-sm text-blue-700">
                  All communication must happen through this platform. Do not
                  share contact information or ask candidates to communicate
                  off-platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card className="overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="flex w-80 flex-col border-r border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.userId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition-colors hover:bg-white ${
                        selectedConversation?.userId === conversation.userId
                          ? 'border-l-4 border-l-teal-500 bg-white'
                          : ''
                      }`}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="truncate text-sm font-semibold text-gray-900">
                            {conversation.userName}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 rounded-full bg-teal-500 px-2 py-0.5 text-xs text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="mb-1 truncate text-xs text-gray-600">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(conversation.lastMessageTime)}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <User className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No conversations yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Start by shortlisting candidates
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex flex-1 flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.userName}
                          </h3>
                          {selectedConversation.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.userType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => {
                        const showDateDivider =
                          index === 0 ||
                          formatDate(messages[index - 1].sentAt) !==
                            formatDate(message.sentAt);

                        return (
                          <div key={message.id}>
                            {showDateDivider && (
                              <div className="my-4 flex items-center justify-center">
                                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                                  {formatDate(message.sentAt)}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className="max-w-md">
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    message.isOutgoing
                                      ? 'bg-teal-600 text-white'
                                      : 'border border-gray-200 bg-white text-gray-900'
                                  }`}
                                >
                                  {message.subject && (
                                    <p
                                      className={`mb-1 text-xs font-semibold ${
                                        message.isOutgoing
                                          ? 'text-teal-100'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {message.subject}
                                    </p>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                                <div
                                  className={`mt-1 flex items-center gap-1 text-xs text-gray-500 ${
                                    message.isOutgoing
                                      ? 'justify-end'
                                      : 'justify-start'
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(message.sentAt)}</span>
                                  {message.isOutgoing && message.isRead && (
                                    <CheckCircle className="ml-1 h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-500">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-gray-200 bg-white p-4"
                  >
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        disabled={isSending}
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Send
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      No Conversation Selected
                    </h3>
                    <p className="text-gray-600">
                      Select a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function IndustryMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
