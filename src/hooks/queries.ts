/**
 * react-query hooks over the real admin API.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService, type UserQuery } from "@/services/admin";
import {
  adminsService,
  type AdminCreateInput,
  type AdminUpdateInput,
} from "@/services/admins";
import { contentService } from "@/services/content";
import { billingService } from "@/services/billing";
import type {
  PlanInput,
  PaymentStatus,
  AdminSettings,
} from "@/types";

export const queryKeys = {
  stats: ["stats"] as const,
  users: ["users"] as const,
  sessions: ["sessions"] as const,
  admins: ["admins"] as const,
  groups: ["groups"] as const,
  questions: ["questions"] as const,
  plans: ["plans"] as const,
  payments: ["payments"] as const,
  billingStats: ["billing-stats"] as const,
  settings: ["settings"] as const,
  feedback: ["feedback"] as const,
};

export const useStats = () =>
  useQuery({ queryKey: queryKeys.stats, queryFn: adminService.getStats });

export const useUsers = (params?: UserQuery) =>
  useQuery({
    queryKey: [...queryKeys.users, params ?? {}],
    queryFn: () => adminService.getUsers(params),
  });

export const useSessions = (params?: { limit?: number; offset?: number }) =>
  useQuery({
    queryKey: [...queryKeys.sessions, params ?? {}],
    queryFn: () => adminService.getSessions(params),
  });

// ── Admin accounts ───────────────────────────────────────────────────────────

export const useAdmins = () =>
  useQuery({ queryKey: queryKeys.admins, queryFn: adminsService.list });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminCreateInput) => adminsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins }),
  });
};

export const useUpdateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminUpdateInput }) =>
      adminsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins }),
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins }),
  });
};

// ── IELTS speaking content ───────────────────────────────────────────────────

export const useGroups = (part: number) =>
  useQuery({ queryKey: [...queryKeys.groups, part], queryFn: () => contentService.groups(part) });

export const useGroupMutations = () => {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: queryKeys.groups });
  return {
    create: useMutation({ mutationFn: (d: { part: number; title: string; tag?: string | null }) => contentService.createGroup(d), onSuccess: inv }),
    update: useMutation({ mutationFn: ({ id, d }: { id: number; d: any }) => contentService.updateGroup(id, d), onSuccess: inv }),
    remove: useMutation({ mutationFn: (id: number) => contentService.deleteGroup(id), onSuccess: inv }),
  };
};

export const useQuestions = (groupId: number | null) =>
  useQuery({
    queryKey: [...queryKeys.questions, groupId],
    queryFn: () => contentService.questions(groupId as number),
    enabled: groupId != null,
  });

export const useQuestionMutations = (groupId: number | null) => {
  const qc = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: [...queryKeys.questions, groupId] });
    qc.invalidateQueries({ queryKey: queryKeys.groups });
  };
  return {
    create: useMutation({ mutationFn: (text: string) => contentService.createQuestion(groupId as number, text), onSuccess: inv }),
    update: useMutation({ mutationFn: ({ id, text }: { id: number; text: string }) => contentService.updateQuestion(id, text), onSuccess: inv }),
    remove: useMutation({ mutationFn: (id: number) => contentService.deleteQuestion(id), onSuccess: inv }),
  };
};

// ── Billing: plans ─────────────────────────────────────────────────────────

export const usePlans = () =>
  useQuery({ queryKey: queryKeys.plans, queryFn: billingService.plans });

export const usePlanMutations = () => {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: queryKeys.plans });
  return {
    create: useMutation({ mutationFn: (d: PlanInput) => billingService.createPlan(d), onSuccess: inv }),
    update: useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<PlanInput> }) => billingService.updatePlan(id, d), onSuccess: inv }),
    remove: useMutation({ mutationFn: (id: number) => billingService.deletePlan(id), onSuccess: inv }),
  };
};

// ── Billing: payments + stats ───────────────────────────────────────────────

export const usePayments = (status?: PaymentStatus) =>
  useQuery({
    queryKey: [...queryKeys.payments, status ?? "all"],
    queryFn: () => billingService.payments(status),
  });

export const useBillingStats = () =>
  useQuery({ queryKey: queryKeys.billingStats, queryFn: billingService.billingStats });

export const usePaymentMutations = () => {
  const qc = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: queryKeys.payments });
    qc.invalidateQueries({ queryKey: queryKeys.billingStats });
  };
  return {
    confirm: useMutation({ mutationFn: (id: number) => billingService.confirmPayment(id), onSuccess: inv }),
    reject: useMutation({ mutationFn: (id: number) => billingService.rejectPayment(id), onSuccess: inv }),
  };
};

// ── Billing: settings ─────────────────────────────────────────────────────────

export const useSettings = () =>
  useQuery({ queryKey: queryKeys.settings, queryFn: billingService.settings });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Partial<AdminSettings>) => billingService.updateSettings(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.settings }),
  });
};

// ── Feedback moderation ─────────────────────────────────────────────────────

export const useFeedback = () =>
  useQuery({ queryKey: queryKeys.feedback, queryFn: billingService.feedback });

export const useFeedbackMutations = () => {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: queryKeys.feedback });
  return {
    approve: useMutation({ mutationFn: (id: number) => billingService.approveFeedback(id), onSuccess: inv }),
    reject: useMutation({ mutationFn: (id: number) => billingService.rejectFeedback(id), onSuccess: inv }),
  };
};
