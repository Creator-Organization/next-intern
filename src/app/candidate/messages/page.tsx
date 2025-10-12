'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Search,
  MoreVertical,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/ui/header';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  sentAt: Date;
  sender?: {
    id: string;
    email: string;
    userType: string;
  };
  receiver?: {
    id: string;
    email: string;
    userType: string;
  };
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

const MessagesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/messages/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [status]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
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

        // ✅ FIX: Create proper message object matching Message interface
        const newMsg: Message = {
          id: data.data.id,
          senderId: session!.user!.id,
          receiverId: selectedConversation.userId,
          subject: undefined,
          content: newMessage.trim(),
          isRead: false,
          readAt: undefined,
          sentAt: new Date(),
          sender: {
            id: session!.user!.id,
            email: session!.user!.email || '',
            userType: 'CANDIDATE',
          },
          receiver: {
            id: selectedConversation.userId,
            email: selectedConversation.userName,
            userType: selectedConversation.userType,
          },
        };

        // ✅ Add message to state
        setMessages([...messages, newMsg]);
        setNewMessage('');

        // ✅ Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);

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
        <div className="text-center">
          <div className="border-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        user={
          user
            ? {
                id: user.id,
                email: user.email || '',
                userType: user.userType,
                candidate: user.name
                  ? {
                      firstName: user.name.split(' ')[0] || '',
                      lastName: user.name.split(' ')[1] || '',
                    }
                  : undefined,
              }
            : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-manrope text-2xl font-bold text-gray-900">
            Messages
          </h1>
          <p className="text-gray-600">
            Communicate with companies about opportunities
          </p>
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
                  All communication must happen through this platform. Sharing
                  contact information or moving conversations off-platform
                  violates our terms of service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                          ? 'border-l-primary-500 border-l-4 bg-white'
                          : ''
                      }`}
                    >
                      <div className="bg-primary-100 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Building className="text-primary-600 h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                              {conversation.companyName ||
                                conversation.userName}
                            </span>
                            {conversation.isVerified && (
                              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary-500 ml-2 rounded-full px-2 py-0.5 text-xs text-white">
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
                    <p className="text-sm text-gray-500">
                      No conversations found
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
                      <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full">
                        <Building className="text-primary-600 h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.companyName ||
                              selectedConversation.userName}
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
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* ✅ FIXED: Messages List with Better Text Visibility */}
                  <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => {
                        const isOwnMessage = message.senderId === user?.id;
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
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}
                              >
                                {/* ✅ FIXED: Better contrast for message bubbles */}
                                <div
                                  className={`rounded-lg px-4 py-2 shadow-sm ${
                                    isOwnMessage
                                      ? 'bg-primary-100 text-gray-900' // <-- dark text for sent messages, lighter bg
                                      : 'border border-gray-200 bg-white text-gray-900'
                                  }`}
                                >
                                  {message.subject && (
                                    <p
                                      className={`mb-1 text-xs font-semibold ${
                                        isOwnMessage
                                          ? 'text-primary-700'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {message.subject}
                                    </p>
                                  )}
                                  {/* ✅ FIXED: Explicit text color with better weight */}
                                  <p className={`text-sm whitespace-pre-wrap font-medium ${
                                    isOwnMessage 
                                      ? 'text-gray-900' // <-- dark text for sent messages
                                      : 'text-gray-900'
                                  }`}>
                                    {message.content}
                                  </p>
                                </div>
                                <div
                                  className={`mt-1 flex items-center gap-1 text-xs text-gray-500 ${
                                    isOwnMessage
                                      ? 'justify-end'
                                      : 'justify-start'
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(message.sentAt)}</span>
                                  {isOwnMessage && message.isRead && (
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
                        <Send className="mr-2 h-4 w-4" />
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
};

export default MessagesPage;