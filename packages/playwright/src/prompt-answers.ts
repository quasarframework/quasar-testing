export interface PromptsAnswers {
  options: string[];
}

// The answers come from quasar.extensions.json, which a user can edit.
export function normalizePromptsAnswers(
  prompts: Record<string, unknown>,
): PromptsAnswers {
  const rawOptions = prompts['options'];

  return {
    options: Array.isArray(rawOptions)
      ? rawOptions.filter(
          (option: unknown): option is string => typeof option === 'string',
        )
      : [],
  };
}
