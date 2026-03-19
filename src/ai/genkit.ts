import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { getModelApiKey } from '@/ai/config';

const modelApiKey = getModelApiKey();

export const ai = genkit({
  plugins: [modelApiKey ? googleAI({ apiKey: modelApiKey }) : googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
