import { useQuery } from "@tanstack/react-query";

interface NpmDownloadsResponse {
  downloads: { downloads: number; day: string }[];
}

function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}m`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
}

export function useNpmDownloads() {
  return useQuery<string | null>({
    queryKey: ["npm-downloads", "@lashen-martino/arven"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.npmjs.org/downloads/range/2010-01-01:2030-01-01/@lashen-martino%2Farven"
      );
      if (!response.ok) return "0";
      const data = (await response.json()) as NpmDownloadsResponse;
      const total = data.downloads.reduce((sum, d) => sum + d.downloads, 0);
      return formatDownloads(total);
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
