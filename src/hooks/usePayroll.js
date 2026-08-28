import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/apiPayroll";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
}
