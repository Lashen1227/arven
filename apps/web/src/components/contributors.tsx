import { useQuery } from "@tanstack/react-query";
import * as Tooltip from "@radix-ui/react-tooltip";

type GitHubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

function ContributorAvatar({ contributor }: { contributor: GitHubContributor }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={contributor.avatar_url}
              alt={contributor.login}
              className="h-14 w-14 rounded-full border-2 border-zinc-200 transition-transform hover:scale-110 hover:border-zinc-400"
            />
          </a>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-50 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 shadow-lg"
          >
            <p className="text-sm font-medium text-zinc-900">{contributor.login}</p>
            <p className="text-xs text-zinc-500">
              {contributor.contributions} contribution{contributor.contributions === 1 ? "" : "s"}
            </p>
            <Tooltip.Arrow className="fill-zinc-100" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function Contributors() {
  const query = useQuery<GitHubContributor[]>({
    queryKey: ["contributors", "Lashen1227", "arven"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.github.com/repos/Lashen1227/arven/contributors?per_page=100",
        {
          headers: { Accept: "application/vnd.github+json" },
        }
      );
      if (!response.ok) throw new Error("Failed to load contributors");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
        ))}
      </div>
    );
  }

  if (query.isError) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {query.data?.map((contributor) => (
        <ContributorAvatar key={contributor.login} contributor={contributor} />
      ))}
    </div>
  );
}
