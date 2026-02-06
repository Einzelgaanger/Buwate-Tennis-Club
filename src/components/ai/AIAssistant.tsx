import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Calendar, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  is_booking_mode: boolean;
  created_at: string;
}

interface BookingData {
  date: string;
  time: string;
  duration: number;
  court_preference: string;
}

interface AIAssistantProps {
  onBookingRequest?: (booking: BookingData) => void;
}

export function AIAssistant({ onBookingRequest }: AIAssistantProps) {
  const { user, role, profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations when opened
  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  const loadConversations = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setConversations(data as Conversation[]);
    }
  };

  const loadConversation = async (conversationId: string) => {
    const { data: conv } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (conv) {
      setBookingMode(conv.is_booking_mode || false);
    }

    const { data: msgs } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (msgs) {
      setMessages(msgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    }
    
    setCurrentConversationId(conversationId);
    setShowHistory(false);
  };

  const createNewConversation = async (isBooking: boolean = false): Promise<string | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: isBooking ? 'Booking Assistant' : 'New Chat',
        is_booking_mode: isBooking,
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('Failed to create conversation:', error);
      return null;
    }
    
    return data.id;
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      });
    
    // Update conversation title if it's the first user message
    if (role === 'user' && messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await supabase
        .from('ai_conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } else {
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }
  };

  const parseBookingFromResponse = (content: string): BookingData | null => {
    const bookingMatch = content.match(/```booking\n([\s\S]*?)\n```/);
    if (bookingMatch) {
      try {
        return JSON.parse(bookingMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input.trim();
    setInput('');
    
    // Ensure we have a conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation(bookingMode);
      if (!convId) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return;
      }
      setCurrentConversationId(convId);
    }
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Save user message
    await saveMessage(convId, 'user', userMessage);

    let assistantContent = '';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userRole: role,
          action: bookingMode ? 'book' : 'chat',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                  updated[updated.length - 1].content = assistantContent;
                }
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
      }

      // Check for booking data in response
      const bookingData = parseBookingFromResponse(assistantContent);
      if (bookingData && onBookingRequest) {
        toast({
          title: "Booking Ready",
          description: "Click to complete your booking with the suggested details.",
        });
      }

    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      loadConversations(); // Refresh list
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = async () => {
    setBookingMode(false);
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  const startBookingMode = async () => {
    const convId = await createNewConversation(true);
    if (convId) {
      setCurrentConversationId(convId);
      setBookingMode(true);
      setMessages([{
        role: 'assistant',
        content: "I'll help you book a court! Just tell me when you'd like to play. For example:\n\n- \"Book a court for tomorrow at 4pm\"\n- \"I want to play on Saturday morning\"\n- \"Find me a slot this weekend\"\n\nWhat works for you?"
      }]);
      // Save the initial message
      await saveMessage(convId, 'assistant', "I'll help you book a court! Just tell me when you'd like to play. For example:\n\n- \"Book a court for tomorrow at 4pm\"\n- \"I want to play on Saturday morning\"\n- \"Find me a slot this weekend\"\n\nWhat works for you?");
    }
  };

  const quickActions = [
    { label: '📅 Book Court', action: startBookingMode },
    { label: '💰 Pricing', action: () => setInput('What are the court booking prices?') },
    { label: '📋 Rules', action: () => setInput('What are the club rules?') },
    { label: '🎾 Coaching', action: () => setInput('Tell me about coaching options') },
  ];

  if (!user) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">BTC Assistant</h3>
            <p className="text-xs opacity-80">
              {bookingMode ? 'Booking Mode' : 'Ask me anything'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg hover:bg-primary-foreground/20 transition-colors"
            title="Chat History"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={startNewChat}
            className="p-2 rounded-lg hover:bg-primary-foreground/20 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="absolute inset-0 top-[72px] bg-background z-10 flex flex-col">
          <div className="p-4 border-b">
            <h4 className="font-semibold">Chat History</h4>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${
                    currentConversationId === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <p className="font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <Button onClick={() => setShowHistory(false)} variant="outline" className="w-full">
              Back to Chat
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <Bot className="w-12 h-12 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Welcome, {profile?.full_name?.split(' ')[0] || 'there'}!</h4>
              <p className="text-sm text-muted-foreground">
                I can help you book courts, answer questions about pricing, rules, and more.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className="p-3 text-left text-sm rounded-lg border hover:bg-muted transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                      <ReactMarkdown>{message.content.replace(/```booking[\s\S]*?```/g, '')}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={bookingMode ? "When would you like to play?" : "Ask me anything..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Powered by AI • {profile?.full_name || 'Guest'}
        </p>
      </div>
    </div>
  );
}
