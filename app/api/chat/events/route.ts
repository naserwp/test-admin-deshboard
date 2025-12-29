import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/app/lib/realtime/bus";
import { logError } from "@/app/lib/log";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId") || null;
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let unsubscribe: (() => void) | null = null;
        subscribe((event) => {
          if (event.conversationId !== conversationId) return;
          send(event);
        })
          .then((fn) => {
            unsubscribe = fn;
          })
          .catch((error) => {
            logError("chat.events_subscribe_failed", error, { conversationId });
          });

        const heartbeat = setInterval(() => {
          send({ type: "ping" });
        }, 20000);

        send({ type: "connected" });

        const abort = () => {
          clearInterval(heartbeat);
          if (unsubscribe) unsubscribe();
          controller.close();
        };
        req.signal.addEventListener("abort", abort);
      },
      cancel() {
        // no-op; handled by abort listener
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    logError("chat.events_failed", error);
    return NextResponse.json({ error: "Events unavailable" }, { status: 503 });
  }
}
