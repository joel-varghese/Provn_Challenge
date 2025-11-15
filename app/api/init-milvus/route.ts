export const runtime = "nodejs"; 

import { NextResponse } from "next/server";
import { milvus } from "@/lib/milvus";
import { embed } from "@/lib/embed";

const CATEGORIES = [
    {
        id: 1,
        category: "filler",
        text: "Filler words like um, uh, like, and you know reduce speaking fluency."
      },
      {
        id: 2,
        category: "pacing",
        text: "Pacing refers to speaking too fast or too slow during speech delivery."
      },
      {
        id: 3,
        category: "clarity",
        text: "Clarity issues arise when speech is mumbled, unclear, or poorly articulated."
      }
];

export async function POST() {
  try {
    await milvus.createCollection({
        collection_name: "feedback_categories",
        fields: [
            { name: "id", data_type: "Int64", is_primary_key: true },
            { name: "category", data_type: "VarChar", max_length: 50 },
            { name: "embedding", data_type: "FloatVector", dim: 384 },
        ],
    });

    await milvus.createIndex({
      collection_name: "feedback_categories",
      field_name: "embedding",
      index_name: "embedding_index",
      index_type: "IVF_FLAT",
      metric_type: "COSINE",
      params: { nlist: 1024 },
    });

    for (const item of CATEGORIES) {
        const vector = await embed(item.text);
    
        await milvus.insert({
          collection_name: "feedback_categories",
          data: [{
            id: item.id,
            category: item.category,
            embedding: vector,
          }],
        });
      }

      await milvus.loadCollection({
        collection_name: "feedback_categories",
      });
    
      return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error("INIT ERROR:", e);
    return NextResponse.json({ error: e.message }, {status: 500});
  }
}