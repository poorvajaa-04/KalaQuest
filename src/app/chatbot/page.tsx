'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageShell } from '@/components/page-shell';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface ChatApiResponse {
  ok: boolean;
  answer?: string;
  conversationId?: string;
  error?: string;
  details?: string;
}

const USER_KEY = 'chatbot-manual-user-id';
const MAP_KEY = 'chatbot-conversation-map';

function buildFallbackUserId() {
  return `guest-${crypto.randomUUID().slice(0, 8)}`;
}

function readConversationMap() {
  if (typeof window === 'undefined') {
    return {} as Record<string, string>;
  }

  try {
    const raw = localStorage.getItem(MAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {} as Record<string, string>;
  }
}

function writeConversationMap(map: Record<string, string>) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(MAP_KEY, JSON.stringify(map));
}

export default function ChatbotPage() {
  const { user } = useUser();
  const [manualUserId, setManualUserId] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [message, setMessage] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUserId = localStorage.getItem(USER_KEY);
    if (storedUserId) {
      setManualUserId(storedUserId);
    } else {
      const generated = buildFallbackUserId();
      localStorage.setItem(USER_KEY, generated);
      setManualUserId(generated);
    }
  }, []);

  const userId = useMemo(() => {
    return user?.uid ?? manualUserId.trim();
  }, [manualUserId, user?.uid]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const map = readConversationMap();
    const existing = map[userId];
    if (existing) {
      setConversationId(existing);
      return;
    }

    const fresh = crypto.randomUUID();
    map[userId] = fresh;
    writeConversationMap(map);
    setConversationId(fresh);
  }, [userId]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || !userId || !conversationId) {
      return;
    }

    const text = message.trim();
    setMessage('');
    setStatus('');
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);

    setIsSending(true);
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'chat',
          userId,
          conversationId,
          message: text,
          topK: 5,
          historyLimit: 12,
        }),
      });

      const data = (await response.json()) as ChatApiResponse;
      if (!response.ok || !data.ok || !data.answer) {
        const errorText = data.error ?? 'Chat request failed';
        const detailText = data.details ? `: ${data.details}` : '';
        throw new Error(`${errorText}${detailText}`);
      }

      const resolvedConversationId = data.conversationId ?? conversationId;
      setConversationId(resolvedConversationId);
      writeConversationMap({
        ...readConversationMap(),
        [userId]: resolvedConversationId,
      });

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: data.answer as string }]);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown error';
      setStatus(messageText);
    } finally {
      setIsSending(false);
    }
  }

  async function saveMemory() {
    if (!memoryInput.trim() || !userId) {
      return;
    }

    setStatus('');
    const text = memoryInput.trim();
    setMemoryInput('');

    setIsSending(true);
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'remember',
          userId,
          remember: text,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.error ?? 'Failed to save memory');
      }

      setStatus('Memory saved.');
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown error';
      setStatus(messageText);
    } finally {
      setIsSending(false);
    }
  }

  function startNewConversation() {
    if (!userId) {
      return;
    }

    const fresh = crypto.randomUUID();
    setConversationId(fresh);
    setMessages([]);
    setStatus('Started a new conversation thread.');
    writeConversationMap({
      ...readConversationMap(),
      [userId]: fresh,
    });
  }

  function onManualUserIdChange(value: string) {
    setManualUserId(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, value);
    }
  }

  return (
    <PageShell className="max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>AI Chatbot with Long-Term Memory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">User ID</p>
              <Input
                value={userId}
                onChange={(event) => onManualUserIdChange(event.target.value)}
                disabled={Boolean(user?.uid)}
                placeholder="your-user-id"
              />
              <p className="text-xs text-muted-foreground">
                Signed-in users use Firebase UID automatically. Guests can edit this field.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Conversation ID</p>
              <Input value={conversationId} readOnly />
              <Button type="button" variant="outline" onClick={startNewConversation} disabled={!userId || isSending}>
                New Conversation
              </Button>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">API Key Setup</p>
            <p className="text-sm text-muted-foreground">
              Set your own `GOOGLE_API_KEY` in `.env.local` and restart the server. Do not use Firebase `apiKey` for chatbot model calls.
            </p>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">Save Memory</p>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                value={memoryInput}
                onChange={(event) => setMemoryInput(event.target.value)}
                placeholder="Example: I am vegetarian"
                disabled={isSending || !userId}
              />
              <Button type="button" onClick={saveMemory} disabled={isSending || !memoryInput.trim() || !userId}>
                Remember
              </Button>
            </div>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-md border p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((entry) => (
                <div
                  key={entry.id}
                  className={entry.role === 'user' ? 'ml-auto max-w-[85%] rounded-md bg-primary p-3 text-primary-foreground' : 'mr-auto max-w-[85%] rounded-md bg-muted p-3'}
                >
                  <p className="text-xs font-medium">{entry.role === 'user' ? 'You' : 'Assistant'}</p>
                  <p className="whitespace-pre-wrap text-sm">{entry.text}</p>
                </div>
              ))
            )}
          </div>

          <form className="space-y-2" onSubmit={sendMessage}>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask anything. For inline save: remember that I like pottery"
              rows={4}
              disabled={isSending || !userId || !conversationId}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Conversation is persisted by user ID in browser local storage.</p>
              <Button type="submit" disabled={isSending || !message.trim() || !userId || !conversationId}>
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>

          {status ? <p className="text-sm text-destructive">{status}</p> : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
