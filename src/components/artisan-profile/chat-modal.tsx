"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useFirestore } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";
import { createOrReuseConversation, sendConversationMessage } from "@/lib/inbox";
import { useToast } from "@/hooks/use-toast";
import type { ArtisanRecord } from "@/types/artisan";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type ChatModalProps = {
  artisan?: ArtisanRecord | null;
  inlineTriggerLabel?: string;
  isLoading?: boolean;
  showFloatingButton?: boolean;
  showInlineTrigger?: boolean;
};

const DEFAULT_MESSAGE = "Hi, I'm interested in your craft";

export function ChatModal({
  artisan,
  inlineTriggerLabel = "Chat with Artisan",
  isLoading = false,
  showFloatingButton = true,
  showInlineTrigger = true,
}: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState(DEFAULT_MESSAGE);
  const [emailInput, setEmailInput] = useState(artisan?.email ?? "");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setEmailInput(artisan?.email ?? "");
  }, [artisan?.email]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const artisanName = artisan?.name ?? "this artisan";
  const isMessagingUnavailable = !artisan || (!artisan.userId && !artisan.email);
  const trimmedMessage = messageText.trim();
  const chatDescription = artisan?.userId
    ? `Send a first message to ${artisanName}. This will continue in your inbox.`
    : artisan?.email
      ? `Send a first message using ${artisanName}'s linked account email.`
      : "Messaging is currently unavailable for this artisan.";

  const requestOpen = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "Log in to message an artisan.",
      });
      return;
    }

    if (isMessagingUnavailable) {
      toast({
        variant: "destructive",
        title: "Messaging unavailable",
        description: "This artisan is not yet linked to a messaging account.",
      });
      return;
    }

    setIsOpen(true);
    setMessageText(DEFAULT_MESSAGE);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isSendingMessage) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      setMessageText(DEFAULT_MESSAGE);
    }
  };

  const handleSendFirstMessage = async () => {
    if (!artisan) {
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "Log in to message an artisan.",
      });
      return;
    }

    if (!trimmedMessage) {
      toast({
        variant: "destructive",
        title: "Message required",
        description: "Write a short message before sending.",
      });
      return;
    }

    setIsSendingMessage(true);
    let shouldKeepLoadingUntilClose = false;

    try {
      const currentRole =
        typeof window !== "undefined" ? window.localStorage.getItem("loginRole") ?? "user" : "user";

      const conversation = artisan.userId
        ? await createOrReuseConversation({
            firestore,
            currentUser: user,
            currentRole,
            target: {
              recipientUid: artisan.userId,
              recipientName: artisan.name,
            },
          })
        : await createOrReuseConversation({
            firestore,
            currentUser: user,
            currentRole,
            target: {
              recipientEmail: emailInput || artisan.email || "",
              recipientName: artisan.name,
            },
          });

      await sendConversationMessage({
        firestore,
        conversationId: conversation.conversationId,
        participants: [user.uid, conversation.recipientUid],
        senderId: user.uid,
        text: trimmedMessage,
      });

      toast({
        title: "Message sent successfully",
      });

      const recipientParam = artisan.userId
        ? `recipient=${encodeURIComponent(artisan.userId)}`
        : `recipientEmail=${encodeURIComponent(artisan.email || emailInput)}`;
      const nameParam = `name=${encodeURIComponent(artisan.name)}`;

      shouldKeepLoadingUntilClose = true;
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        setMessageText(DEFAULT_MESSAGE);
        setIsSendingMessage(false);
        router.push(`/inbox?${recipientParam}&${nameParam}`);
      }, 2000);
      return;
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Unable to send message",
        description: error?.message || "Please try again.",
      });
    } finally {
      if (!shouldKeepLoadingUntilClose) {
        setIsSendingMessage(false);
      }
    }
  };

  if (isLoading) {
    return (
      <>
        {showInlineTrigger ? <Skeleton className="h-10 w-40" /> : null}
        {showFloatingButton ? (
          <Skeleton className="fixed bottom-6 right-6 z-30 h-12 w-28 rounded-full shadow-lg" />
        ) : null}
      </>
    );
  }

  return (
    <>
      {showInlineTrigger ? (
        <Button type="button" variant="outline" onClick={requestOpen} disabled={!artisan}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {inlineTriggerLabel}
        </Button>
      ) : null}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message {artisanName}</DialogTitle>
            <CardDescription>{chatDescription}</CardDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!artisan?.userId && artisan?.email ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recipient Email</p>
                <Input
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="artisan@example.com"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <p className="text-sm font-medium">Your Message</p>
              <Textarea
                rows={5}
                className="min-h-[132px]"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder={`Introduce yourself to ${artisanName} or ask about the craft.`}
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setMessageText(DEFAULT_MESSAGE);
                }}
                disabled={isSendingMessage}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendFirstMessage}
                disabled={isSendingMessage || !trimmedMessage}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isSendingMessage ? "Sending..." : "Send and Open Inbox"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showFloatingButton ? (
        <Button
          type="button"
          size="lg"
          className="fixed bottom-4 right-4 z-30 rounded-full shadow-lg sm:bottom-6 sm:right-6"
          onClick={requestOpen}
          disabled={!artisan}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Chat
        </Button>
      ) : null}
    </>
  );
}
