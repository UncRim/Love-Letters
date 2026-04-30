import { notFound } from "next/navigation";
import { fetchOpenEnvelope } from "@/lib/server/open-letter";
import OpenLetterClient from "./OpenLetterClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpenLetterPage({ params }: PageProps) {
  const { id } = await params;
  const envelope = await fetchOpenEnvelope(id);
  if (!envelope) notFound();
  return <OpenLetterClient letterId={id} envelope={envelope} />;
}
