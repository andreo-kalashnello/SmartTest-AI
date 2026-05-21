import { TestPlayPage } from "@/views/test-play";

export default async function Page({
  params,
}: {
  params: Promise<{ pin: string }>;
}) {
  const { pin } = await params;
  return <TestPlayPage pin={pin} />;
}
