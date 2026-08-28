import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getLeaveRequests,
  applyLeave,
  reviewLeave,
  cancelLeave,
  getLeaveBalances,
} from "../services/apiLeave";

export const leaveKeys = {
  all: ["leave"],
  list: (filters) => ["leave", "list", filters],
  balances: (id) => ["leave", "balances", id],
};

export function useLeaveRequests(filters = {}) {
  return useQuery({
    queryKey: leaveKeys.list(filters),
    queryFn: () => getLeaveRequests(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLeaveBalances(employeeId) {
  return useQuery({
    queryKey: leaveKeys.balances(employeeId),
    queryFn: () => getLeaveBalances(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: applyLeave,
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}

/**
 * Optimistic approve/reject: the row flips state instantly, and rolls
 * back if the server (or an RLS policy) rejects the write.
 */
export function useReviewLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewLeave,
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: leaveKeys.all });
      const snapshot = qc.getQueriesData({ queryKey: leaveKeys.all });

      qc.setQueriesData({ queryKey: leaveKeys.all }, (old) =>
        Array.isArray(old)
          ? old.map((r) => (r.id === id ? { ...r, status } : r))
          : old
      );
      return { snapshot };
    },
    onError: (e, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(e.message);
    },
    onSuccess: (data) =>
      toast.success(data.status === "approved" ? "Leave approved" : "Leave rejected"),
    onSettled: () => qc.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelLeave,
    onSuccess: () => {
      toast.success("Request withdrawn");
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}
