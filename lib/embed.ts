import {pipeline} from "@xenova/transformers"

let embedder: any = null;

export async function embed(text: string) {
    if (!embedder) {
      embedder = await pipeline(
        "feature-extraction",
        "Xenova/bge-small-en-v1.5"
      );
    }

    const result = await embedder(text, {
      pooling: "mean",
      normalize: true,
    });
  
    return Array.from(result.data);
  }