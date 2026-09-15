// Both generators write source files holding paths read from the filesystem.
// A path may contain a single quote or a backslash.

/** A JavaScript string literal in single quotes, the style of the generated files. */
export function quote(value: string) {
  const escaped = value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");

  return `'${escaped}'`;
}
