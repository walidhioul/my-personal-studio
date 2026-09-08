import { useQuery } from "@tanstack/react-query";
import { getHomePageData } from "@/api/homePage";

export const homePageKeys = {
  all: ["home-page-data"] as const,
};

/** Single cached source for homepage courses + feedbacks (one request). */
export function useHomePageData() {
  return useQuery({
    queryKey: homePageKeys.all,
    queryFn: getHomePageData,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
