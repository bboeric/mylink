import { PublicProfile } from "@/components/PublicProfile";

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <PublicProfile username={username.toLowerCase()} />;
}
