import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";

type ConversationTarget =
  | {
      recipientUid: string;
      recipientName?: string;
    }
  | {
      recipientEmail: string;
      recipientName?: string;
    };

type ConversationResult = {
  conversationId: string;
  recipientUid: string;
};

function buildConversationId(a: string, b: string) {
  const [first, second] = [a, b].sort();
  return `${first}_${second}`;
}

async function resolveRecipientByEmail(firestore: Firestore, emailValue: string) {
  const email = emailValue.trim().toLowerCase();
  const directoryRef = collection(firestore, "user_directory");
  const lookupQuery = query(directoryRef, where("email", "==", email), limit(1));
  const snapshot = await getDocs(lookupQuery);

  if (snapshot.empty) {
    throw new Error("No user found with that email.");
  }

  const docSnap = snapshot.docs[0];
  const data = docSnap.data() as { uid?: string; name?: string };

  return {
    uid: data.uid || docSnap.id,
    name: data.name,
  };
}

export async function createOrReuseConversation(params: {
  firestore: Firestore;
  currentUser: User;
  currentRole?: string;
  target: ConversationTarget;
}): Promise<ConversationResult> {
  let recipientUid = "recipientUid" in params.target ? params.target.recipientUid.trim() : "";
  let recipientName = params.target.recipientName;

  if (!recipientUid && "recipientEmail" in params.target) {
    const resolved = await resolveRecipientByEmail(params.firestore, params.target.recipientEmail);
    recipientUid = resolved.uid;
    recipientName = recipientName || resolved.name;
  }

  if (!recipientUid) {
    throw new Error("Recipient is required.");
  }

  if (recipientUid === params.currentUser.uid) {
    throw new Error("You cannot message yourself.");
  }

  const conversationId = buildConversationId(params.currentUser.uid, recipientUid);
  const participantInfo = {
    [params.currentUser.uid]: {
      name: params.currentUser.displayName ?? "",
      email: params.currentUser.email ?? "",
      role: params.currentRole ?? "user",
    },
    ...(recipientName ? { [recipientUid]: { name: recipientName } } : {}),
  };

  const summaryBase = {
    conversationId,
    participants: [params.currentUser.uid, recipientUid],
    participantInfo,
    lastMessage: "",
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    doc(params.firestore, "conversations", conversationId),
    {
      ...summaryBase,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(params.firestore, "users", params.currentUser.uid, "conversations", conversationId),
    summaryBase,
    { merge: true }
  );

  await setDoc(
    doc(params.firestore, "users", recipientUid, "conversations", conversationId),
    summaryBase,
    { merge: true }
  );

  return { conversationId, recipientUid };
}

export async function sendConversationMessage(params: {
  firestore: Firestore;
  conversationId: string;
  participants: string[];
  senderId: string;
  text: string;
}) {
  const trimmed = params.text.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty.");
  }

  await addDoc(collection(params.firestore, "conversations", params.conversationId, "messages"), {
    senderId: params.senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(params.firestore, "conversations", params.conversationId), {
    lastMessage: trimmed,
    lastSenderId: params.senderId,
    updatedAt: serverTimestamp(),
  });

  for (const participant of params.participants) {
    await updateDoc(doc(params.firestore, "users", participant, "conversations", params.conversationId), {
      lastMessage: trimmed,
      lastSenderId: params.senderId,
      updatedAt: serverTimestamp(),
    });
  }
}
