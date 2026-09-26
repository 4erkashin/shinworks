/**
 * Local Storybook while developing.
 * The public Storybook once the app is built for production.
 */
const storybookUrlDefault =
  process.env.NODE_ENV === "production"
    ? "https://storybook.shinworks.dev/"
    : "http://localhost:6006";

/**
 * Direct `process.env` reads. A dynamic lookup would hide the name
 * from the bundler, so each variable is written out here.
 *
 * An unset or empty variable uses the built-in value.
 * Set the variable to replace that value.
 */
const environmentVariables = {
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "cherkashin.ju@gmail.com",
  GITHUB_URL:
    process.env.GITHUB_URL || "https://github.com/4erkashin/shinworks",
  STORYBOOK_URL: process.env.STORYBOOK_URL || storybookUrlDefault,
} as const;

export function readEnvironmentVariable(
  name: keyof typeof environmentVariables,
): string {
  return environmentVariables[name];
}
