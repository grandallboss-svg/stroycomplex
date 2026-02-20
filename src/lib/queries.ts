'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from './store'

const API_BASE = '/api'

// Хелпер для fetch с авторизацией
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const token = useAppStore.getState().token
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// ==================== AUTH ====================
export function useLogin() {
  const queryClient = useQueryClient()
  const { setUser, setToken } = useAppStore()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetchApi<{ user: unknown; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      // @ts-expect-error - dynamic user object
      setUser(data.user)
      // @ts-expect-error - user id as token
      setToken(data.user.id)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useCurrentUser() {
  const token = useAppStore((state) => state.token)
  
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => fetchApi<{ user: unknown }>('/auth/me'),
    enabled: !!token,
  })
}

// ==================== DIRECTIONS ====================
export function useDirections() {
  return useQuery({
    queryKey: ['directions'],
    queryFn: () => fetchApi<unknown[]>('/directions'),
  })
}

export function useDirection(id: string) {
  return useQuery({
    queryKey: ['directions', id],
    queryFn: () => fetchApi<unknown>(`/directions/${id}`),
    enabled: !!id,
  })
}

export function useCreateDirection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/directions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directions'] })
    },
  })
}

export function useUpdateDirection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/directions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directions'] })
    },
  })
}

export function useDeleteDirection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/directions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directions'] })
    },
  })
}

// ==================== BUILDINGS ====================
export function useBuildings() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: () => fetchApi<unknown[]>('/buildings'),
  })
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: ['buildings', id],
    queryFn: () => fetchApi<unknown>(`/buildings/${id}`),
    enabled: !!id,
  })
}

export function useCreateBuilding() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/buildings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/buildings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/buildings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

// ==================== PLANS ====================
export function usePlans(filters?: { status?: string; directionId?: string; buildingId?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.directionId) params.append('directionId', filters.directionId)
  if (filters?.buildingId) params.append('buildingId', filters.buildingId)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['plans', filters],
    queryFn: () => fetchApi<unknown[]>(`/plans${queryString ? `?${queryString}` : ''}`),
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => fetchApi<unknown>(`/plans/${id}`),
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/plans/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// ==================== STAGES ====================
export function useStages(planId: string) {
  return useQuery({
    queryKey: ['stages', planId],
    queryFn: () => fetchApi<unknown[]>(`/stages?planId=${planId}`),
    enabled: !!planId,
  })
}

export function useCreateStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/stages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // @ts-expect-error - dynamic workPlanId
      queryClient.invalidateQueries({ queryKey: ['stages', variables.workPlanId] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdateStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/stages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useDeleteStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/stages/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// ==================== DOCUMENTS KS-2 ====================
export function useKS2Documents(filters?: { planId?: string; period?: string }) {
  const params = new URLSearchParams()
  if (filters?.planId) params.append('planId', filters.planId)
  if (filters?.period) params.append('period', filters.period)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['ks2', filters],
    queryFn: () => fetchApi<unknown[]>(`/documents/ks2${queryString ? `?${queryString}` : ''}`),
  })
}

export function useKS2Document(id: string) {
  return useQuery({
    queryKey: ['ks2', id],
    queryFn: () => fetchApi<unknown>(`/documents/ks2/${id}`),
    enabled: !!id,
  })
}

export function useCreateKS2() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/documents/ks2', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ks2'] })
    },
  })
}

export function useUpdateKS2() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/documents/ks2/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ks2'] })
    },
  })
}

export function useDeleteKS2() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/documents/ks2/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ks2'] })
    },
  })
}

// ==================== DOCUMENTS KS-3 ====================
export function useKS3Documents(filters?: { planId?: string; period?: string }) {
  const params = new URLSearchParams()
  if (filters?.planId) params.append('planId', filters.planId)
  if (filters?.period) params.append('period', filters.period)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['ks3', filters],
    queryFn: () => fetchApi<unknown[]>(`/documents/ks3${queryString ? `?${queryString}` : ''}`),
  })
}

export function useCreateKS3() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/documents/ks3', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ks3'] })
    },
  })
}

export function useDeleteKS3() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/documents/ks3/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ks3'] })
    },
  })
}

// ==================== HIDDEN ACTS ====================
export function useHiddenActs(planId?: string) {
  const params = planId ? `?planId=${planId}` : ''
  
  return useQuery({
    queryKey: ['hidden-acts', planId],
    queryFn: () => fetchApi<unknown[]>(`/documents/hidden-acts${params}`),
  })
}

export function useCreateHiddenAct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/documents/hidden-acts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hidden-acts'] })
    },
  })
}

// ==================== EMPLOYEES ====================
export function useEmployees(filters?: { status?: string; position?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.position) params.append('position', filters.position)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => fetchApi<unknown[]>(`/employees${queryString ? `?${queryString}` : ''}`),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchApi<unknown>(`/employees/${id}`),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/employees/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

// ==================== SALARY ====================
export function useSalaryPayments(filters?: { employeeId?: string; period?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.period) params.append('period', filters.period)
  if (filters?.status) params.append('status', filters.status)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['salary', filters],
    queryFn: () => fetchApi<unknown[]>(`/salary${queryString ? `?${queryString}` : ''}`),
  })
}

export function useCreateSalaryPayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/salary', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] })
    },
  })
}

export function useUpdateSalaryPayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/salary/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] })
    },
  })
}

// ==================== ORDERS ====================
export function useOrders(filters?: { planId?: string; status?: string; assignedTo?: string }) {
  const params = new URLSearchParams()
  if (filters?.planId) params.append('planId', filters.planId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchApi<unknown[]>(`/orders${queryString ? `?${queryString}` : ''}`),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => fetchApi<unknown>(`/orders/${id}`),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/orders/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ==================== SCHEMES ====================
export function useSchemes(filters?: { directionId?: string; buildingId?: string }) {
  const params = new URLSearchParams()
  if (filters?.directionId) params.append('directionId', filters.directionId)
  if (filters?.buildingId) params.append('buildingId', filters.buildingId)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['schemes', filters],
    queryFn: () => fetchApi<unknown[]>(`/schemes${queryString ? `?${queryString}` : ''}`),
  })
}

export function useCreateScheme() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/schemes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] })
    },
  })
}

// ==================== SAFETY ====================
export function useBriefings(directionId?: string) {
  const params = directionId ? `?directionId=${directionId}` : ''
  
  return useQuery({
    queryKey: ['briefings', directionId],
    queryFn: () => fetchApi<unknown[]>(`/safety/briefings${params}`),
  })
}

export function useCreateBriefing() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/safety/briefings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
    },
  })
}

export function useSafetyRecords(employeeId?: string, briefingId?: string) {
  const params = new URLSearchParams()
  if (employeeId) params.append('employeeId', employeeId)
  if (briefingId) params.append('briefingId', briefingId)
  
  const queryString = params.toString()
  
  return useQuery({
    queryKey: ['safety-records', { employeeId, briefingId }],
    queryFn: () => fetchApi<unknown[]>(`/safety/records${queryString ? `?${queryString}` : ''}`),
  })
}

export function useCreateSafetyRecord() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/safety/records', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-records'] })
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
    },
  })
}

// ==================== DASHBOARD ====================
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchApi<{
      overview: {
        buildings: number
        employees: number
        plansStats: {
          total: number
          draft: number
          inProgress: number
          completed: number
        }
      }
      directionProgress: Array<{
        id: string
        name: string
        code: string
        color: string
        icon: string
        plansCount: number
        progress: number
        totalAmount: number
      }>
      ks2Documents: unknown[]
      ks3Documents: unknown[]
      upcomingDeadlines: unknown[]
      ks2TotalAmount: number
    }>('/dashboard'),
  })
}

// ==================== USERS ====================
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchApi<unknown[]>('/users'),
  })
}

// ==================== SETTINGS ====================
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Record<string, string>>('/settings'),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
