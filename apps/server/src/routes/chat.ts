import { connectionToDriver, getActiveConnection } from '../lib/server-utils';
import { getContext } from 'hono/context-storage';
import { AiChatPrompt } from '../lib/prompts';
import type { HonoContext } from '../ctx';
import { openai } from '@ai-sdk/openai';
import { tools } from './agent/tools';
import { Autumn } from 'autumn-js';
import { streamText } from 'ai';

export const chatHandler = async () => {
  const c = getContext<HonoContext>();

  const { session } = c.var;
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  console.log('Checking chat permissions for user:', session.user.id);
  const canSendMessages = await Autumn.check({
    feature_id: 'chat-messages',
    customer_id: session.user.id,
  });
  console.log('Autumn check result:', JSON.stringify(canSendMessages, null, 2));

  if (!canSendMessages.data) {
    console.log('No data returned from Autumn check');
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  if (canSendMessages.data.unlimited) {
    console.log('User has unlimited access');
  } else if (!canSendMessages.data.balance) {
    console.log('No balance and not unlimited');
    return c.json({ error: 'Insufficient plan quota' }, 403);
  } else if (canSendMessages.data.balance <= 0) {
    console.log('Balance is 0 or less');
    return c.json({ error: 'Insufficient plan balance' }, 403);
  }

  await getActiveConnection().catch((err) => {
    console.error('Error in getActiveConnection:', err);
    throw c.json({ error: 'Failed to get active connection' }, 500);
  });

  const { messages, threadId, currentFolder, currentFilter } = await c.req
    .json()
    .catch((err: Error) => {
      console.error('Error parsing JSON:', err);
      throw c.json({ error: 'Failed to parse request body' }, 400);
    });

  const result = streamText({
    model: openai('gpt-4o'),
    system: AiChatPrompt(threadId, currentFolder, currentFilter),
    messages,
    tools,
    onError: (error) => {
      console.error('Error in streamText:', error);
      //   throw c.json({ error: 'Failed to stream text' }, 500);
    },
  });

  return result.toDataStreamResponse();
};
