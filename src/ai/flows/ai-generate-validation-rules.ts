'use server';
/**
 * @fileOverview AI-assisted generation of validation rules for form fields.
 *
 * - generateValidationRules - A function that generates validation rules based on the form's context.
 * - GenerateValidationRulesInput - The input type for the generateValidationRules function.
 * - GenerateValidationRulesOutput - The return type for the generateValidationRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateValidationRulesInputSchema = z.object({
  formContext: z.string().describe('The context of the form, including a description of the purpose of the form and the fields it contains.'),
});
export type GenerateValidationRulesInput = z.infer<typeof GenerateValidationRulesInputSchema>;

const GenerateValidationRulesOutputSchema = z.object({
  validationRules: z.record(z.string(), z.array(z.string())).describe('A JSON object where each key is a field name and each value is an array of validation rules for that field.'),
});
export type GenerateValidationRulesOutput = z.infer<typeof GenerateValidationRulesOutputSchema>;

export async function generateValidationRules(input: GenerateValidationRulesInput): Promise<GenerateValidationRulesOutput> {
  return generateValidationRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateValidationRulesPrompt',
  input: {schema: GenerateValidationRulesInputSchema},
  output: {schema: GenerateValidationRulesOutputSchema},
  prompt: `You are an AI assistant that helps generate validation rules for form fields based on the form's context.

  Given the following form context:
  {{formContext}}

  Generate a JSON object where each key is a field name and each value is an array of validation rules for that field. The validation rules should be strings that can be used in a form validation library like Zod or Yup.  Include rules for common validation requirements such as required fields, email format, and numeric ranges where appropriate.  Be concise and only include rules that are relevant to the form's context.

  Example Output:
  {
    "name": ["required", "minLength:3"],
    "email": ["required", "email"],
    "age": ["required", "number", "min:18", "max:120"]
  }

  Ensure the output is valid JSON.
  `,
});

const generateValidationRulesFlow = ai.defineFlow(
  {
    name: 'generateValidationRulesFlow',
    inputSchema: GenerateValidationRulesInputSchema,
    outputSchema: GenerateValidationRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
