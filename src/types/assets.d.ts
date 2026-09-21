// Processed sprite imports are resolved by Replayable's build pipeline.
declare module '*.avif' {
  const source: string;
  export default source;
}

declare module '*.webp' {
  const source: string;
  export default source;
}

// Processed fonts are loaded before the scene is created.
declare module '*.woff2' {
  const source: string;
  export default source;
}

// Processed audio imports are resolved by Replayable’s build pipeline.
declare module '*.m4a' {
  const source: string;
  export default source;
}

declare module '*.mp3' {
  const source: string;
  export default source;
}
