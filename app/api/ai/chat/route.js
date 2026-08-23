import { NextResponse } from 'next/server';
import { processAIConversation } from '../../../lib/aiController';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, history, currentIntent, currentEntities } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const response = await processAIConversation({
      query,
      history: history || [],
      currentIntent: currentIntent || null,
      currentEntities: currentEntities || {},
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Chat Route Error:', error);
    return NextResponse.json(
      {
        intent: 'GENERAL_APPLICATION_HELP',
        state: 'START',
        action: 'NO_ACTION',
        language: 'en',
        message: 'The assistant encountered a temporary issue. You can browse verified services directly from the menu.',
        entities: {},
        required_fields: [],
        known_fields: [],
        missing_fields: [],
        confidence: 0.5,
        requires_backend_data: false,
      },
      { status: 200 }
    );
  }
}
