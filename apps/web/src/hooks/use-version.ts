import { useQuery } from "@tanstack/react-query";

export function useVersion() {
  return useQuery<string | null>({
    queryKey: ["arven-version"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.github.com/repos/Lashen1227/arven/releases/latest",
        {
          headers: { Accept: "application/vnd.github+json" },
        }
      );
      if (!response.ok) throw new Error("Failed to load version");
      const data = (await response.json()) as { tag_name?: string };
      return data.tag_name ?? null;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
