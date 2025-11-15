import { MilvusClient } from "@zilliz/milvus2-sdk-node";

export const milvus = new MilvusClient({
    address: "https://in03-5223ff782a72af1.serverless.aws-eu-central-1.cloud.zilliz.com",
    token: process.env.MILVUS_API_KEY,
})
