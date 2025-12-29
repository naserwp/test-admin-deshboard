type LogMeta = Record<string, any>;

export function logError(event: string, error: unknown, meta: LogMeta = {}) {
  const payload = {
    level: "error",
    event,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    meta,
  };
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(payload));
}

export function logInfo(event: string, meta: LogMeta = {}) {
  const payload = { level: "info", event, meta };
  // eslint-disable-next-line no-console
  console.info(JSON.stringify(payload));
}
