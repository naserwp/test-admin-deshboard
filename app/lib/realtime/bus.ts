import { EventEmitter } from "events";

type RealtimeEvent =
  | { type: "message:new"; conversationId: string; payload: any }
  | { type: "status:update"; conversationId: string; payload: any };

const emitter: EventEmitter = (global as any).__voRealtimeEmitter ?? new EventEmitter();
(global as any).__voRealtimeEmitter = emitter;

export async function publish(event: RealtimeEvent) {
  emitter.emit("event", event);
}

export async function subscribe(handler: (event: RealtimeEvent) => void) {
  emitter.on("event", handler);
  return () => emitter.off("event", handler);
}
