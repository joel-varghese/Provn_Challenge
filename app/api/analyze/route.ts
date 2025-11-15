export const runtime = "nodejs"; 


import { NextResponse } from "next/server";
import { embed } from "@/lib/embed";
import { milvus } from "@/lib/milvus";

export async function POST(req: Request){
    try {
    const data = await req.json();

    const results = {
      filler: [],
      pacing: [],
      clarity: [],
    };

    console.log("INPUT:", data);

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
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: "Failed inside analyze route", details: String(err) },
      { status: 500 }
    );
  }
}
