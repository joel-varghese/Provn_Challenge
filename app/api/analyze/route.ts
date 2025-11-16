export const runtime = "nodejs"; 


import { NextResponse } from "next/server";
import { embed } from "@/lib/embed";
import { milvus } from "@/lib/milvus";

export async function GET(req: Request) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const url = new URL(req.url);
        const dataParam = url.searchParams.get("feedback");
        if (!dataParam) throw new Error("No feedback provided");

        const data = JSON.parse(dataParam);

        const results = { filler: [], pacing: [], clarity: [] };

        for (const item of data.feedback) {
          const vec = await embed(item.message);
          const search = await milvus.search({
            collection_name: "feedback_categories",
            vector: vec,
            topk: 1,
            metric_type: "COSINE",
            output_fields: ["category"],
          });

          const top = search.results[0];
          const category = top.category;
          results[category].push(item);

          // Push incremental update
          const message = `data: ${JSON.stringify({ category, item })}\n\n`;
          controller.enqueue(encoder.encode(message));
        }

        const doneMsg = `data: ${JSON.stringify({ done: true })}\n\n`;
        controller.enqueue(encoder.encode(doneMsg));

        
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
