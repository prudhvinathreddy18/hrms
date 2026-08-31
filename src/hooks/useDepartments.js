import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/apiDepartments";
import { employeeKeys } from "./useEmployees";

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: getDepartments });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department created");
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: (data) => {
      toast.success("Department updated");
      qc.setQueryData(["departments"], (old) =>
        Array.isArray(old)
          ? old.map((d) => (d.id === data.id ? { ...d, ...data } : d))
          : old,
      );
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success("Department removed");
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}
