import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from "../services/apiEmployees";

export const employeeKeys = {
  all: ["employees"],
  list: (filters) => ["employees", "list", filters],
  detail: (id) => ["employees", "detail", id],
};

export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => getEmployees(filters),
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => getEmployee(id),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Employee added");
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      toast.success("Changes saved");
      qc.setQueryData(employeeKeys.detail(data.id), (old) => ({ ...old, ...data }));
      qc.setQueriesData(
        { queryKey: employeeKeys.all },
        (old) =>
          Array.isArray(old)
            ? old.map((e) => (e.id === data.id ? { ...e, ...data } : e))
            : old,
      );
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeactivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateEmployee,
    onSuccess: () => {
      toast.success("Employee deactivated");
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (e) => toast.error(e.message),
  });
}
