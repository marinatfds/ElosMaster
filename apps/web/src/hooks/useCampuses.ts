import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCampuses } from "../api/campuses";

/** Nomes dos núcleos cadastrados, em ordem alfabética (vazio enquanto carrega). */
export function useCampuses() {
  const query = useQuery({ queryKey: ["campuses"], queryFn: listCampuses });
  const names = useMemo(() => (query.data ?? []).map((campus) => campus.name), [query.data]);
  return { names, isLoading: query.isLoading };
}
