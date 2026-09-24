/**
 * Direct `process.env` reads. A dynamic lookup would hide the name
 * from the bundler, so each variable is written out here.
 */
const environmentVariables = {
  STORYBOOK_URL: process.env.STORYBOOK_URL,
} as const;

/**
 * Optional configuration. An unset or empty value means the feature
 * stays off; callers render without it.
 */
export function readEnvironmentVariable(
  name: keyof typeof environmentVariables,
): undefined | string {
  const value = environmentVariables[name];

  if (!value) {
    return undefined;
  }

  return value;
}
