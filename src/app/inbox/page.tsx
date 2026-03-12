'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

type Conversation = {
  id: string;
  conversationId?: string;
  participants: string[];
  participantInfo?: Record<string, { name?: string; email?: string; role?: string }>;
  lastMessage?: string;
  updatedAt?: { seconds: number; nanoseconds: number };
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

const getDisplayName = (conversation: Conversation, currentUid: string) => {
  const otherId = conversation.participants.find((id) => id !== currentUid);
  if (!otherId) return 'Unknown';
  const info = conversation.participantInfo?.[otherId];
  return info?.name || info?.email || 'Unknown';
};

const formatTimestamp = (timestamp?: { seconds: number }) => {
  if (!timestamp?.seconds) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString();
};

const buildConversationId = (a: string, b: string) => {
  const [first, second] = [a, b].sort();
  return `${first}_${second}`;
};

function InboxContent() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientUid, setRecipientUid] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const lastNotifiedMessageIdRef = useRef<string | null>(null);

  const isReady = useMemo(() => !isLoading && !!user?.uid, [isLoading, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const conversationsRef = collection(firestore, 'users', user.uid, 'conversations');
    const q = query(conversationsRef, orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Conversation[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Conversation, 'id'>),
        }));
        setConversations(items);
        if (activeConversation) {
          const updated = items.find((item) => item.id === activeConversation.id);
          if (updated) setActiveConversation(updated);
        }
      },
      (error) => {
        console.error('Conversation listener error', error);
        toast({
          variant: 'destructive',
          title: 'Inbox error',
          description: error?.message || 'Unable to load conversations.',
        });
      }
    );
    return () => unsubscribe();
  }, [firestore, user?.uid]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    if (user?.uid && !activeConversation.participants?.includes(user.uid)) {
      setMessages([]);
      return;
    }
    const conversationId = activeConversation.conversationId || activeConversation.id;
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    let hasLoadedInitial = false;
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Message[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Message, 'id'>),
        }));
        setMessages(items);

        if (!hasLoadedInitial) {
          hasLoadedInitial = true;
          if (items.length > 0) {
            lastNotifiedMessageIdRef.current = items[items.length - 1].id;
          }
          return;
        }

        const latest = items[items.length - 1];
        if (!latest) return;
        if (latest.id === lastNotifiedMessageIdRef.current) return;
        lastNotifiedMessageIdRef.current = latest.id;

        if (latest.senderId === user?.uid) return;
        if (typeof window === 'undefined') return;
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        if (document.hasFocus()) return;

        const senderName = activeConversation
          ? getDisplayName(activeConversation, user?.uid ?? '')
          : 'New message';
        new Notification(senderName, {
          body: latest.text,
        });
      },
      (error) => {
        console.error('Messages listener error', error);
        toast({
          variant: 'destructive',
          title: 'Message error',
          description: error?.message || 'Unable to load messages.',
        });
      }
    );
    return () => unsubscribe();
  }, [firestore, activeConversation?.id, user?.uid, activeConversation]);

  const createConversation = async (recipientId: string, recipientName?: string) => {
    if (!user?.uid) return;
    const trimmed = recipientId.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Recipient required',
        description: 'Enter the recipient user UID to start a conversation.',
      });
      return;
    }
    if (trimmed === user.uid) {
      toast({
        variant: 'destructive',
        title: 'Invalid recipient',
        description: 'You cannot message yourself.',
      });
      return;
    }

    const existing = conversations.find(
      (conversation) =>
        conversation.participants.includes(user.uid) && conversation.participants.includes(trimmed)
    );
    if (existing) {
      setActiveConversation(existing);
      return;
    }

    setIsCreating(true);
    try {
      let resolvedRecipientName = recipientName;
      if (!resolvedRecipientName) {
        try {
          const directoryRef = collection(firestore, 'user_directory');
          const q = query(directoryRef, where('uid', '==', trimmed), limit(1));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as { name?: string; email?: string };
            resolvedRecipientName = data.name || data.email;
          }
        } catch (lookupError) {
          console.warn('Failed to resolve recipient name', lookupError);
        }
      }

      const conversationId = buildConversationId(user.uid, trimmed);
      const conversationRef = doc(firestore, 'conversations', conversationId);
      const participantInfo = {
        [user.uid]: {
          name: user.displayName ?? '',
          email: user.email ?? '',
          role: window.localStorage.getItem('loginRole') ?? 'user',
        },
        ...(resolvedRecipientName ? { [trimmed]: { name: resolvedRecipientName } } : {}),
      };
      await setDoc(conversationRef, {
        participants: [user.uid, trimmed],
        participantInfo,
        lastMessage: '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
      const summaryBase = {
        conversationId,
        participants: [user.uid, trimmed],
        participantInfo,
        lastMessage: '',
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(firestore, 'users', user.uid, 'conversations', conversationId), summaryBase, { merge: true });
      await setDoc(doc(firestore, 'users', trimmed, 'conversations', conversationId), summaryBase, { merge: true });

      setActiveConversation({
        id: conversationId,
        conversationId,
        participants: [user.uid, trimmed],
        participantInfo,
        lastMessage: '',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to start chat',
        description: error?.message || 'Unable to create conversation.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!recipientUid.trim()) {
      toast({
        variant: 'destructive',
        title: 'Recipient required',
        description: 'Enter the recipient user UID to start a conversation.',
      });
      return;
    }
    setIsCreating(true);
    try {
      await createConversation(recipientUid);
      setRecipientUid('');
    } finally {
      setIsCreating(false);
    }
  };

  const createConversationByEmail = async (emailValue: string) => {
    const email = emailValue.trim().toLowerCase();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Enter the recipient email to start a conversation.',
      });
      return;
    }

    setIsCreating(true);
    try {
      const directoryRef = collection(firestore, 'user_directory');
      const q = query(directoryRef, where('email', '==', email), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'User not found',
          description: 'No user found with that email.',
        });
        return;
      }
      const docSnap = snapshot.docs[0];
      const data = docSnap.data() as { uid?: string; name?: string };
      const uid = data.uid || docSnap.id;
      await createConversation(uid, data.name);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lookup failed',
        description: error?.message || 'Unable to find user by email.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateByEmail = async () => {
    await createConversationByEmail(recipientEmail);
    setRecipientEmail('');
  };

  const handleSendMessage = async () => {
    if (!user?.uid || !activeConversation) return;
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setIsSending(true);
    try {
      const conversationId = activeConversation.conversationId || activeConversation.id;
      const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        text: trimmed,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(firestore, 'conversations', conversationId), {
        lastMessage: trimmed,
        lastSenderId: user.uid,
        updatedAt: serverTimestamp(),
      });
      for (const participant of activeConversation.participants ?? []) {
        await updateDoc(doc(firestore, 'users', participant, 'conversations', conversationId), {
          lastMessage: trimmed,
          lastSenderId: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      setNewMessage('');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to send',
        description: error?.message || 'Unable to send message.',
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    const recipient = searchParams.get('recipient');
    const recipientEmailParam = searchParams.get('recipientEmail');
    if (!recipient && !recipientEmailParam) return;
    const name = searchParams.get('name') ?? undefined;
    if (recipientEmailParam) {
      void createConversationByEmail(recipientEmailParam);
      return;
    }
    if (recipient) {
      void createConversation(recipient, name);
    }
    setRecipientUid('');
  }, [searchParams, user?.uid, conversations.length]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }
    setNotificationStatus(Notification.permission);
  }, []);

  const requestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      toast({
        title: 'Notifications enabled',
        description: 'You will receive alerts for new messages.',
      });
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 text-center">
          <h1 className="font-headline text-4xl md:text-5xl">
            {activeConversation
              ? `Conversation with ${getDisplayName(activeConversation, user?.uid ?? '')}`
              : 'Inbox'}
          </h1>
          <p className="mt-3 text-base text-foreground/80">
            Real-time conversations between artisans and users.
          </p>
          <div className="mt-4 flex justify-center">
            {notificationStatus === 'unsupported' ? (
              <span className="text-xs text-foreground/60">Browser notifications not supported.</span>
            ) : notificationStatus === 'granted' ? (
              <span className="text-xs text-foreground/60">Notifications enabled.</span>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={requestNotifications}>
                Enable Notifications
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Conversations</CardTitle>
              <CardDescription>Start a new chat or open an existing thread.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Recipient UID"
                  value={recipientUid}
                  onChange={(event) => setRecipientUid(event.target.value)}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleCreateConversation}
                  disabled={!isReady || isCreating}
                >
                  {isCreating ? 'Starting...' : 'Start Conversation'}
                </Button>
                <Input
                  placeholder="Recipient email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCreateByEmail}
                  disabled={!isReady || isCreating}
                >
                  {isCreating ? 'Starting...' : 'Start by Email'}
                </Button>
                <p className="text-xs text-foreground/60">
                  Use UID or email to begin a chat.
                </p>
              </div>

              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <p className="text-sm text-foreground/70">No conversations yet.</p>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setActiveConversation(conversation)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        activeConversation?.id === conversation.id
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-border bg-background hover:border-amber-200'
                      }`}
                    >
                      <p className="font-semibold text-foreground">
                        {getDisplayName(conversation, user?.uid ?? '')}
                      </p>
                      <p className="text-xs text-foreground/60 line-clamp-1">
                        {conversation.lastMessage || 'No messages yet.'}
                      </p>
                      <p className="text-[11px] text-foreground/50">
                        {formatTimestamp(conversation.updatedAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                {activeConversation
                  ? getDisplayName(activeConversation, user?.uid ?? '')
                  : 'Conversation'}
              </CardTitle>
              <CardDescription>
                {activeConversation
                  ? 'Message thread'
                  : 'Select a conversation to begin'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[360px] overflow-y-auto rounded-lg border border-border bg-background p-4">
                {activeConversation ? (
                  messages.length === 0 ? (
                    <p className="text-sm text-foreground/70">No messages yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isMine = message.senderId === user?.uid;
                        return (
                          <div
                            key={message.id}
                            className={`rounded-lg px-3 py-2 text-sm ${
                              isMine ? 'ml-auto max-w-[75%] bg-amber-100 text-amber-900' : 'max-w-[75%] bg-slate-100'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className="mt-1 text-[11px] text-foreground/50">
                              {formatTimestamp(message.createdAt)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <p className="text-sm text-foreground/70">
                    Select a conversation from the left panel.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  rows={3}
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  disabled={!activeConversation}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendMessage}
                  disabled={!activeConversation || isSending || !newMessage.trim()}
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-foreground/70">Loading inbox…</p>
          </div>
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
