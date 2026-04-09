import { z } from 'zod';

// Multilingual text field validation
const multiLingualSchema = z.object({
  en: z.string().optional(),
  fr: z.string().optional(),
  ar: z.string().optional(),
});

// Step validation schema
export const stepSchema = z.object({
  title: multiLingualSchema,
  content: multiLingualSchema,
  image_url: z.string().url().nullable().optional(),
  code_snippet: z.string().nullable().optional(),
});

export const stepsArraySchema = z.array(stepSchema);

// Attachment validation schema
export const attachmentSchema = z.object({
  file_type: z.enum(['stl', 'ino', 'image', 'other', 'zip']),
  file_name: z.string().min(1, "File name is required"),
  file_url: z.string().url("Must be a valid URL"),
  file_size: z.number().nullable().optional(),
});

export const attachmentsArraySchema = z.array(attachmentSchema);

// Generic function to safely parse and validate JSON strings
export function safeParseJson<T>(
  jsonStr: string | null | undefined, 
  schema: z.ZodType<T>, 
  maxBytes: number = 1000000 // 1MB limit by default
): T | null {
  if (!jsonStr) return null;

  // Basic check for DoS mitigation
  if (new Blob([jsonStr]).size > maxBytes) {
    throw new Error('Payload size exceeds local limits.');
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return schema.parse(parsed);
  } catch (err) {
    console.error('Validation Error for JSON payload:', err);
    throw new Error('Invalid payload data.');
  }
}
