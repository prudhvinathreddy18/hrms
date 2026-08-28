import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getTodayAttendance,
  getMyAttendance,
  getTeamAttendance,
  checkIn,
  checkOut,
} from "../services/apiAttendance";

export const attKeys = {
  all: ["attendance"],
  today: (id) => ["attendance", "today", id],
  mine: (id, from, to) => ["attendance", "mine", id, from, to],
  team: (date) => ["attendance", "team", date],
};

export function useTodayAttendance(employeeId) {
  return useQuery({
    queryKey: attKeys.today(employeeId),
    queryFn: () => getTodayAttendance(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useMyAttendance(employeeId, from, to) {
  return useQuery({
    queryKey: attKeys.mine(employeeId, from, to),
    queryFn: () => getMyAttendance({ employeeId, from, to }),
    enabled: Boolean(employeeId),
  });
}

export function useTeamAttendance(date) {
  return useQuery({
    queryKey: attKeys.team(date),
    queryFn: () => getTeamAttendance({ date }),
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success("Checked in");
      qc.invalidateQueries({ queryKey: attKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      toast.success("Checked out");
      qc.invalidateQueries({ queryKey: attKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}
