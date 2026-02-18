import { create } from 'zustand'

// Типы данных
export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'ADMIN' | 'MANAGER' | 'FOREMAN' | 'WORKER' | 'ACCOUNTANT'
  position: string | null
  avatar: string | null
  isActive: boolean
}

export interface WorkDirection {
  id: string
  name: string
  code: string
  description: string | null
  color: string
  icon: string | null
  isActive: boolean
  _count?: { workPlans: number; schemes: number }
}

export interface Building {
  id: string
  name: string
  address: string | null
  floors: number
  totalArea: number | null
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNED' | 'SUSPENDED'
  _count?: { workPlans: number; schemes: number }
}

export interface WorkStage {
  id: string
  workPlanId: string
  name: string
  description: string | null
  order: number
  startDate: string | null
  endDate: string | null
  plannedAmount: number
  actualAmount: number
  percentComplete: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED'
}

export interface WorkPlan {
  id: string
  name: string
  contractNumber: string | null
  workDirectionId: string
  buildingId: string
  startDate: string
  endDate: string
  totalAmount: number
  vatRate: number
  status: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes: string | null
  workDirection?: WorkDirection
  building?: Building
  stages?: WorkStage[]
  _count?: { stages: number; documentsKS2: number; documentsKS3: number }
}

export interface Employee {
  id: string
  fullName: string
  shortName: string | null
  phone: string | null
  email: string | null
  position: string | null
  specialty: string | null
  hourlyRate: number
  monthlySalary: number
  hireDate: string | null
  fireDate: string | null
  status: 'ACTIVE' | 'FIRED' | 'VACATION' | 'SICK'
  notes: string | null
  _count?: { workAssignments: number; salaryPayments: number; orderAssignments: number }
}

export interface DocumentKS2Item {
  id: string
  lineNumber: number
  name: string
  unit: string
  quantity: number
  unitPrice: number
  totalAmount: number
}

export interface DocumentKS2 {
  id: string
  number: string
  workPlanId: string
  period: string
  totalAmount: number
  vatAmount: number
  totalWithVat: number
  status: 'DRAFT' | 'SIGNED' | 'APPROVED'
  notes: string | null
  createdAt: string
  signedAt: string | null
  workPlan?: WorkPlan
  items?: DocumentKS2Item[]
  _count?: { documentsKS3: number }
}

export interface DocumentKS3 {
  id: string
  number: string
  workPlanId: string
  ks2Id: string
  period: string
  totalAmount: number
  vatAmount: number
  totalWithVat: number
  previousTotal: number
  currentTotal: number
  status: 'DRAFT' | 'SIGNED' | 'APPROVED'
  workPlan?: WorkPlan
  documentKS2?: DocumentKS2
}

export interface HiddenWorkAct {
  id: string
  number: string
  workPlanId: string
  workStageId: string | null
  name: string
  description: string
  location: string | null
  executedAt: string
  signedAt: string | null
  status: 'DRAFT' | 'SIGNED' | 'APPROVED'
  contractorName: string | null
  contractorPosition: string | null
  customerName: string | null
  customerPosition: string | null
  workPlan?: WorkPlan
  workStage?: WorkStage
}

export interface SalaryPayment {
  id: string
  employeeId: string
  period: string
  workDays: number
  hoursWorked: number
  baseAmount: number
  bonus: number
  deductions: number
  tax: number
  total: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  paidAt: string | null
  notes: string | null
  employee?: Employee
}

export interface OrderAssignee {
  id: string
  employeeId: string
  assignedAt: string
  employee?: Employee
}

export interface InstallationOrder {
  id: string
  number: string
  workPlanId: string
  workStageId: string | null
  name: string
  description: string | null
  location: string | null
  deadline: string | null
  status: 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: number
  notes: string | null
  createdAt: string
  completedAt: string | null
  workPlan?: WorkPlan
  workStage?: WorkStage
  assignees?: OrderAssignee[]
}

export interface SafetyBriefing {
  id: string
  name: string
  description: string | null
  workDirectionId: string | null
  required: boolean
  periodDays: number | null
  workDirection?: WorkDirection
  _count?: { records: number }
}

export interface SafetyRecord {
  id: string
  employeeId: string
  briefingId: string
  date: string
  result: string | null
  notes: string | null
  nextDate: string | null
  employee?: Employee
  briefing?: SafetyBriefing
}

export interface InstallationScheme {
  id: string
  name: string
  workDirectionId: string | null
  buildingId: string | null
  floor: number | null
  room: string | null
  description: string | null
  fileUrl: string | null
  fileType: string | null
  fileSize: number | null
  workDirection?: WorkDirection
  building?: Building
}

export interface DashboardData {
  overview: {
    totalPlans: number
    activePlans: number
    completedPlans: number
    totalEmployees: number
    activeEmployees: number
    totalKS2: number
    totalKS3: number
    pendingSalary: number
    totalSalaryAmount: number
    totalOrders: number
    activeOrders: number
  }
  amounts: {
    totalContracts: number
    completedWorks: number
  }
  directions: Array<{
    id: string
    name: string
    code: string
    color: string
    plansCount: number
    totalAmount: number
  }>
  stages: Array<{
    status: string
    _count: { id: number }
  }>
  recentDocuments: DocumentKS2[]
}

// Состояние приложения
interface AppState {
  // Пользователь
  user: User | null
  setUser: (user: User | null) => void
  
  // Текущая страница/секция
  currentSection: string
  setCurrentSection: (section: string) => void
  
  // Боковое меню
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Данные
  directions: WorkDirection[]
  setDirections: (directions: WorkDirection[]) => void
  
  buildings: Building[]
  setBuildings: (buildings: Building[]) => void
  
  workPlans: WorkPlan[]
  setWorkPlans: (plans: WorkPlan[]) => void
  
  employees: Employee[]
  setEmployees: (employees: Employee[]) => void
  
  documentsKS2: DocumentKS2[]
  setDocumentsKS2: (docs: DocumentKS2[]) => void
  
  documentsKS3: DocumentKS3[]
  setDocumentsKS3: (docs: DocumentKS3[]) => void
  
  hiddenWorkActs: HiddenWorkAct[]
  setHiddenWorkActs: (acts: HiddenWorkAct[]) => void
  
  salaryPayments: SalaryPayment[]
  setSalaryPayments: (payments: SalaryPayment[]) => void
  
  orders: InstallationOrder[]
  setOrders: (orders: InstallationOrder[]) => void
  
  briefings: SafetyBriefing[]
  setBriefings: (briefings: SafetyBriefing[]) => void
  
  safetyRecords: SafetyRecord[]
  setSafetyRecords: (records: SafetyRecord[]) => void
  
  schemes: InstallationScheme[]
  setSchemes: (schemes: InstallationScheme[]) => void
  
  dashboard: DashboardData | null
  setDashboard: (data: DashboardData | null) => void
  
  // Загрузка
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Модальные окна
  modalOpen: string | null
  setModalOpen: (modal: string | null) => void
  
  // Выбранные элементы
  selectedItem: WorkPlan | Employee | DocumentKS2 | InstallationOrder | null
  setSelectedItem: (item: WorkPlan | Employee | DocumentKS2 | InstallationOrder | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Пользователь
  user: null,
  setUser: (user) => set({ user }),
  
  // Текущая страница
  currentSection: 'dashboard',
  setCurrentSection: (section) => set({ currentSection: section }),
  
  // Боковое меню
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Данные
  directions: [],
  setDirections: (directions) => set({ directions }),
  
  buildings: [],
  setBuildings: (buildings) => set({ buildings }),
  
  workPlans: [],
  setWorkPlans: (plans) => set({ workPlans: plans }),
  
  employees: [],
  setEmployees: (employees) => set({ employees }),
  
  documentsKS2: [],
  setDocumentsKS2: (docs) => set({ documentsKS2: docs }),
  
  documentsKS3: [],
  setDocumentsKS3: (docs) => set({ documentsKS3: docs }),
  
  hiddenWorkActs: [],
  setHiddenWorkActs: (acts) => set({ hiddenWorkActs: acts }),
  
  salaryPayments: [],
  setSalaryPayments: (payments) => set({ salaryPayments: payments }),
  
  orders: [],
  setOrders: (orders) => set({ orders: orders }),
  
  briefings: [],
  setBriefings: (briefings) => set({ briefings }),
  
  safetyRecords: [],
  setSafetyRecords: (records) => set({ safetyRecords: records }),
  
  schemes: [],
  setSchemes: (schemes) => set({ schemes }),
  
  dashboard: null,
  setDashboard: (data) => set({ dashboard: data }),
  
  // Загрузка
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Модальные окна
  modalOpen: null,
  setModalOpen: (modal) => set({ modalOpen: modal }),
  
  // Выбранные элементы
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
}))

// Форматирование валюты
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Форматирование даты
export const formatDate = (date: string | Date | null): string => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Форматирование даты и времени
export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Статусы для отображения
export const statusLabels: Record<string, Record<string, string>> = {
  workPlan: {
    DRAFT: 'Черновик',
    APPROVED: 'Согласован',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Завершен',
    CANCELLED: 'Отменен',
  },
  workStage: {
    PENDING: 'Ожидает',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Завершен',
    DELAYED: 'Задержан',
    CANCELLED: 'Отменен',
  },
  document: {
    DRAFT: 'Черновик',
    SIGNED: 'Подписан',
    APPROVED: 'Утвержден',
  },
  hiddenAct: {
    DRAFT: 'Черновик',
    SIGNED: 'Подписан',
    APPROVED: 'Утвержден',
  },
  employee: {
    ACTIVE: 'Работает',
    FIRED: 'Уволен',
    VACATION: 'В отпуске',
    SICK: 'На больничном',
  },
  salary: {
    PENDING: 'К выплате',
    PAID: 'Выплачено',
    CANCELLED: 'Отменено',
  },
  order: {
    DRAFT: 'Черновик',
    ASSIGNED: 'Назначен',
    IN_PROGRESS: 'В работе',
    PAUSED: 'На паузе',
    COMPLETED: 'Выполнен',
    CANCELLED: 'Отменен',
  },
  building: {
    ACTIVE: 'Строится',
    COMPLETED: 'Сдан',
    PLANNED: 'Планируется',
    SUSPENDED: 'Приостановлен',
  },
}

// Цвета статусов
export const statusColors: Record<string, Record<string, string>> = {
  workPlan: {
    DRAFT: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  },
  workStage: {
    PENDING: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DELAYED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  },
  document: {
    DRAFT: 'bg-gray-100 text-gray-800',
    SIGNED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
  },
  hiddenAct: {
    DRAFT: 'bg-gray-100 text-gray-800',
    SIGNED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
  },
  employee: {
    ACTIVE: 'bg-green-100 text-green-800',
    FIRED: 'bg-gray-100 text-gray-800',
    VACATION: 'bg-blue-100 text-blue-800',
    SICK: 'bg-yellow-100 text-yellow-800',
  },
  salary: {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  },
  order: {
    DRAFT: 'bg-gray-100 text-gray-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    PAUSED: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  },
  building: {
    ACTIVE: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PLANNED: 'bg-blue-100 text-blue-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  },
}
