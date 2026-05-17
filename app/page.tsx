import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

type HomeProps = {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const token = firstParam(params?.token);

  if (token) {
    redirect(`/auth/callback?token=${encodeURIComponent(token)}`);
  }

  const session = await getSession();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-4xl font-bold tracking-tight">The RPG Club</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Community hub — sign in with Discord to get started.
      </p>
      <div className="flex gap-3">
        <a
          href={`${process.env.API_URL ?? "http://localhost:3000"}/auth/discord`}
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Sign in with Discord
        </a>
        {session && (
          <a
            href={`/members/${session.principal.discord_id}`}
            className="rounded-full border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            My Profile
          </a>
        )}
      </div>
    </main>
  );
}
