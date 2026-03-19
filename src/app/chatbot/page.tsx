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

interface ChatbotHealthResponse {
  ok: boolean;
  ready?: boolean;
  requiresApiKey?: boolean;
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
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [apiStatusMessage, setApiStatusMessage] = useState('Checking chatbot service...');

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

  useEffect(() => {
    let isMounted = true;

    async function checkChatbotHealth() {
      try {
        const response = await fetch('/api/chatbot', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = (await response.json()) as ChatbotHealthResponse;
        const isReady = Boolean(data.ok && data.ready && data.requiresApiKey);

        if (!isMounted) {
          return;
        }

        setApiReady(isReady);
        setApiStatusMessage(
          isReady
            ? 'Chatbot service is ready.'
            : data.details ?? data.error ?? 'Chatbot service is reachable, but the model API key is not configured on the server.',
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setApiReady(false);
        setApiStatusMessage(error instanceof Error ? error.message : 'Unable to reach /api/chatbot.');
      }
    }

    checkChatbotHealth();

    return () => {
      isMounted = false;
    };
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

    if (apiReady === false) {
      setStatus(apiStatusMessage);
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

    if (apiReady === false) {
      setStatus(apiStatusMessage);
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
            <p className="text-sm font-medium">Chatbot Service Status</p>
            <p className="text-sm text-muted-foreground">
              {apiStatusMessage}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Set your own `GOOGLE_API_KEY` in `.env.local` for localhost and in your Vercel project environment variables for deployment. Do not use Firebase `apiKey` for chatbot model calls.
            </p>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">Save Memory</p>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                value={memoryInput}
                onChange={(event) => setMemoryInput(event.target.value)}
                placeholder="Example: I am vegetarian"
                disabled={isSending || !userId || apiReady === false}
              />
              <Button type="button" onClick={saveMemory} disabled={isSending || !memoryInput.trim() || !userId || apiReady === false}>
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
              disabled={isSending || !userId || !conversationId || apiReady === false}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Conversation is persisted by user ID in browser local storage.</p>
              <Button type="submit" disabled={isSending || !message.trim() || !userId || !conversationId || apiReady === false}>
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
