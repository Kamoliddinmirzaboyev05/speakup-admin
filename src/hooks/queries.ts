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
import { feedbackService } from "@/services/feedback";

export const queryKeys = {
  stats: ["stats"] as const,
  users: ["users"] as const,
  sessions: ["sessions"] as const,
  admins: ["admins"] as const,
  groups: ["groups"] as const,
  questions: ["questions"] as const,
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

// ── Feedback moderation ─────────────────────────────────────────────────────

export const useFeedback = () =>
  useQuery({ queryKey: queryKeys.feedback, queryFn: feedbackService.feedback });

export const useFeedbackMutations = () => {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: queryKeys.feedback });
  return {
    approve: useMutation({ mutationFn: (id: number) => feedbackService.approveFeedback(id), onSuccess: inv }),
    reject: useMutation({ mutationFn: (id: number) => feedbackService.rejectFeedback(id), onSuccess: inv }),
  };
};
