'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI-assisted form creation, suggesting optimal question types based on the form's context.
 *
 * - aiAssistedFormCreationQuestionSuggestion - A function that suggests optimal question types for a given form context.
 * - AiAssistedFormCreationQuestionSuggestionInput - The input type for the aiAssistedFormCreationQuestionSuggestion function.
 * - AiAssistedFormCreationQuestionSuggestionOutput - The return type for the aiAssistedFormCreationQuestionSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedFormCreationQuestionSuggestionInputSchema = z.object({
  formContext: z
    .string()
    .describe('The context of the form for which question types are to be suggested.'),
});
export type AiAssistedFormCreationQuestionSuggestionInput = z.infer<
  typeof AiAssistedFormCreationQuestionSuggestionInputSchema
>;

const AiAssistedFormCreationQuestionSuggestionOutputSchema = z.object({
  suggestedQuestionTypes: z
    .array(z.string())
    .describe('An array of suggested question types based on the form context.'),
});
export type AiAssistedFormCreationQuestionSuggestionOutput = z.infer<
  typeof AiAssistedFormCreationQuestionSuggestionOutputSchema
>;

export async function aiAssistedFormCreationQuestionSuggestion(
  input: AiAssistedFormCreationQuestionSuggestionInput
): Promise<AiAssistedFormCreationQuestionSuggestionOutput> {
  return aiAssistedFormCreationQuestionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedFormCreationQuestionSuggestionPrompt',
  input: {schema: AiAssistedFormCreationQuestionSuggestionInputSchema},
  output: {schema: AiAssistedFormCreationQuestionSuggestionOutputSchema},
  prompt: `You are an AI assistant that suggests optimal question types for form creation based on the given context.  Form Context: {{{formContext}}}  Please suggest a list of question types that would be most appropriate for this form.  Return the question types as a JSON array of strings.`,
});

const aiAssistedFormCreationQuestionSuggestionFlow = ai.defineFlow(
  {
    name: 'aiAssistedFormCreationQuestionSuggestionFlow',
    inputSchema: AiAssistedFormCreationQuestionSuggestionInputSchema,
    outputSchema: AiAssistedFormCreationQuestionSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
