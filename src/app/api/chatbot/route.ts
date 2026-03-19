import { NextResponse } from 'next/server';
import { z } from 'zod';
import { chatWithMemory, rememberMany } from '@/ai/chatbot';
import { getMissingModelApiKeyMessage, hasModelApiKey } from '@/ai/config';
import { searchMemory } from '@/ai/vector-memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  mode: z.enum(['chat', 'remember', 'search']).default('chat'),
  userId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  query: z.string().min(1).optional(),
  remember: z.union([z.string().min(1), z.array(z.string().min(1)).max(50)]).optional(),
  topK: z.number().int().min(1).max(20).optional(),
  maxScan: z.number().int().min(20).max(500).optional(),
  historyLimit: z.number().int().min(1).max(50).optional(),
});

function normalizeRememberInput(input: string | string[] | undefined) {
  if (!input) {
    return [] as string[];
  }

  return (Array.isArray(input) ? input : [input]).map((item) => item.trim()).filter(Boolean);
}

function missingApiKeyResponse() {
  return NextResponse.json(
    {
      error: 'Missing model API key',
      details: getMissingModelApiKeyMessage(),
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    if (!hasModelApiKey()) {
      return missingApiKeyResponse();
    }

    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const body = parsed.data;

    if (body.mode === 'remember') {
      const items = normalizeRememberInput(body.remember);
      if (items.length === 0) {
        return NextResponse.json({ error: 'remember mode requires `remember` string or string[]' }, { status: 400 });
      }

      const saved = await rememberMany(body.userId, items);
      return NextResponse.json({ ok: true, savedCount: saved.length, saved });
    }

    if (body.mode === 'search') {
      const queryText = body.query ?? body.message;
      if (!queryText) {
        return NextResponse.json({ error: 'search mode requires `query` or `message`' }, { status: 400 });
      }

      const memories = await searchMemory({
        userId: body.userId,
        queryText,
        topK: body.topK,
        maxScan: body.maxScan,
      });

      return NextResponse.json({ ok: true, memories });
    }

    if (!body.message) {
      return NextResponse.json({ error: 'chat mode requires `message`' }, { status: 400 });
    }

    const result = await chatWithMemory({
      userId: body.userId,
      conversationId: body.conversationId,
      message: body.message,
      topK: body.topK,
      maxScan: body.maxScan,
      historyLimit: body.historyLimit,
      remember: normalizeRememberInput(body.remember),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process chatbot request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/chatbot',
    modes: ['chat', 'remember', 'search'],
    requiresApiKey: hasModelApiKey(),
    ready: hasModelApiKey(),
    note: 'POST JSON with `userId` and mode-specific fields.',
  });
}
