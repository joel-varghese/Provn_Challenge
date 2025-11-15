import feedbackData from "@/data/mock/feedback.json"

export async function GET() {
    await new Promise((r) => setTimeout(r, 3000)); // simulate delay
    return Response.json(feedbackData);
  }