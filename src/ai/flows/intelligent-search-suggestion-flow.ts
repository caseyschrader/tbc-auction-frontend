'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligent search suggestions.
 * It provides alternative search terms or similar items when an initial search yields no direct results.
 *
 * - intelligentSearchSuggestion - The main function to call for getting search suggestions.
 * - IntelligentSearchSuggestionInput - The input type for the intelligentSearchSuggestion function.
 * - IntelligentSearchSuggestionOutput - The return type for the intelligentSearchSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentSearchSuggestionInputSchema = z.object({
  searchQuery: z
    .string()
    .describe('The original search query that yielded no direct results.'),
});
export type IntelligentSearchSuggestionInput = z.infer<
  typeof IntelligentSearchSuggestionInputSchema
>;

const IntelligentSearchSuggestionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested alternative search terms or similar items.'),
});
export type IntelligentSearchSuggestionOutput = z.infer<
  typeof IntelligentSearchSuggestionOutputSchema
>;

export async function intelligentSearchSuggestion(
  input: IntelligentSearchSuggestionInput
): Promise<IntelligentSearchSuggestionOutput> {
  return intelligentSearchSuggestionFlow(input);
}

const intelligentSearchSuggestionPrompt = ai.definePrompt({
  name: 'intelligentSearchSuggestionPrompt',
  input: {schema: IntelligentSearchSuggestionInputSchema},
  output: {schema: IntelligentSearchSuggestionOutputSchema},
  prompt: `The user searched for '{{{searchQuery}}}' but found no direct results.
Please provide 3-5 alternative search terms or similar item suggestions that might help them find what they are looking for.
Present them as a JSON array of strings in the 'suggestions' field.`,
});

const intelligentSearchSuggestionFlow = ai.defineFlow(
  {
    name: 'intelligentSearchSuggestionFlow',
    inputSchema: IntelligentSearchSuggestionInputSchema,
    outputSchema: IntelligentSearchSuggestionOutputSchema,
  },
  async input => {
    const {output} = await intelligentSearchSuggestionPrompt(input);
    return output!;
  }
);
