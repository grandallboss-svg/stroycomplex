'use client'

import { useState, useEffect } from 'react'
import { useAppStore, formatCurrency, formatDate, statusLabels, statusColors, DocumentKS2, DocumentKS3, InstallationOrder, Employee, HiddenWorkAct, WorkPlan } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  LayoutDashboard, Network, Flame, Wind, Building2, FileText, Users, 
  DollarSign, ClipboardList, Shield, Settings, Menu, X, LogOut, 
  Plus, Edit, Eye, Calendar, Briefcase, FileSpreadsheet, FileCheck,
  Printer, Download, Table, GanttChart, Database, Trash2
} from 'lucide-react'
import { toast } from 'sonner'

// Функция конвертации числа в слова (рубли)
function numberToWordsRu(num: number): string {
  const ones = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']
  const thousands = ['', 'тысяча', 'тысячи', 'тысяч']
  const millions = ['', 'миллион', 'миллиона', 'миллионов']
  
  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  
  const rublesEndings = ['рубль', 'рубля', 'рублей']
  const kopecksEndings = ['копейка', 'копейки', 'копеек']
  
  function getEnding(n: number, forms: string[]): string {
    const n10 = n % 10
    const n100 = n % 100
    if (n10 === 1 && n100 !== 11) return forms[0]
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
    return forms[2]
  }
  
  function convertGroup(n: number, isFemale: boolean = false): string {
    if (n === 0) return ''
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10
    let result = hundreds[h]
    
    if (t === 1) {
      result += (result ? ' ' : '') + teens[o]
    } else {
      if (t > 1) result += (result ? ' ' : '') + tens[t]
      if (o > 0) {
        let one = ones[o]
        if (isFemale && o === 1) one = 'одна'
        if (isFemale && o === 2) one = 'две'
        result += (result ? ' ' : '') + one
      }
    }
    return result
  }
  
  let result = ''
  const groups = [
    { value: Math.floor(intPart / 1000000), form: millions, isFemale: false },
    { value: Math.floor((intPart % 1000000) / 1000), form: thousands, isFemale: true },
    { value: intPart % 1000, form: null, isFemale: false }
  ]
  
  for (const group of groups) {
    if (group.value > 0) {
      result += (result ? ' ' : '') + convertGroup(group.value, group.isFemale)
      if (group.form) {
        const ending = getEnding(group.value, group.form)
        result += ' ' + ending
      }
    }
  }
  
  if (intPart > 0) {
    result += ' ' + getEnding(intPart, rublesEndings)
  }
  
  if (decPart > 0) {
    result += ' ' + decPart.toString().padStart(2, '0') + ' ' + getEnding(decPart, kopecksEndings)
  } else {
    result += ' 00 копеек'
  }
  
  return (result.charAt(0).toUpperCase() + result.slice(1)).trim()
}

// Типы
type User = {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'ADMIN' | 'MANAGER' | 'FOREMAN' | 'WORKER' | 'ACCOUNTANT'
  position: string | null
}

// ==================== ФОРМА ВХОДА ====================
function LoginForm() {
  const [email, setEmail] = useState('admin@stroytest.ru')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setUser = useAppStore((s) => s.setUser)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    
    if (res.ok && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success('Добро пожаловать!')
    } else {
      setError(data.error || 'Ошибка авторизации')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">СтройКомплекс</CardTitle>
          <CardDescription>Система управления проектами</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Пароль</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Демо: admin@stroytest.ru / admin123</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== БОКОВОЕ МЕНЮ ====================
function Sidebar() {
  const { user, sidebarOpen, toggleSidebar, setUser, setCurrentSection, currentSection, orders, salaryPayments } = useAppStore()
  const activeOrders = orders?.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length || 0
  const pendingSalary = salaryPayments?.filter(s => s.status === 'PENDING').length || 0

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setCurrentSection('dashboard')
    toast.success('Вы вышли из системы')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Дашборд', section: 'dashboard' },
    { icon: Network, label: 'Направления', section: 'directions' },
    { icon: Building2, label: 'Объекты', section: 'buildings' },
    { icon: Briefcase, label: 'План работ', section: 'plans' },
    { icon: FileSpreadsheet, label: 'КС-2', section: 'ks2' },
    { icon: FileText, label: 'КС-3', section: 'ks3' },
    { icon: FileCheck, label: 'Акты скрытых', section: 'hidden-acts' },
    { icon: Users, label: 'Персонал', section: 'employees' },
    { icon: DollarSign, label: 'Зарплата', section: 'salary', badge: pendingSalary },
    { icon: ClipboardList, label: 'Наряды', section: 'orders', badge: activeOrders },
    { icon: Shield, label: 'Техника безоп.', section: 'safety' },
    { icon: Settings, label: 'Настройки', section: 'settings' },
  ]

  return (
    <aside className={`bg-white border-r flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">СтройКомплекс</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg">
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.section}
            onClick={() => setCurrentSection(item.section)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentSection === item.section ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span> : null}
              </>
            )}
          </button>
        ))}
      </nav>

      {user && sidebarOpen && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-medium">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </aside>
  )
}

// ==================== ДИАЛОГ СОЗДАНИЯ ====================
type StageType = {
  id?: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  plannedAmount?: number
  works: { name: string; unit: string; quantity: number; unitPrice: number }[]
}

function CreateDialog({ type, open, onOpenChange, onSuccess, data }: {
  type: 'direction' | 'building' | 'plan' | 'employee' | 'ks2' | 'ks3' | 'hiddenAct' | 'order' | 'salary' | 'safety'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  data?: Partial<{ directions: unknown[], buildings: unknown[], workPlans: unknown[], employees: unknown[], documentsKS2: unknown[], briefings: unknown[], orders: unknown[] }>
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Record<string, string | number | unknown[]>>({})
  const [items, setItems] = useState<Array<{name: string; unit: string; quantity: number; unitPrice: number}>>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [stages, setStages] = useState<StageType[]>([]) // Этапы для плана работ

  const endpoints: Record<string, string> = {
    direction: '/api/directions',
    building: '/api/buildings',
    plan: '/api/plans',
    employee: '/api/employees',
    ks2: '/api/documents/ks2',
    ks3: '/api/documents/ks3',
    hiddenAct: '/api/documents/hidden-acts',
    order: '/api/orders',
    salary: '/api/salary',
    safety: '/api/safety/records',
  }

  // Импорт работ из наряда
  const importFromOrder = () => {
    if (!selectedOrderId) return
    const order = ((data?.orders as {id: string, number: string, name: string, items?: {name: string, unit: string, quantity: number, unitPrice: number}[]}[]) || []).find(o => o.id === selectedOrderId)
    if (order && order.items && order.items.length > 0) {
      const newItems = order.items.map(item => ({
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
      setItems([...items, ...newItems])
      toast.success(`Импортировано ${newItems.length} позиций из наряда ${order.number}`)
      setSelectedOrderId('')
    } else {
      toast.error('В наряде нет позиций для импорта')
    }
  }

  // Добавить этап
  const addStage = () => {
    setStages([...stages, { name: '', works: [] }])
  }

  // Удалить этап
  const removeStage = (idx: number) => {
    setStages(stages.filter((_, i) => i !== idx))
  }

  // Обновить этап
  const updateStage = (idx: number, field: string, value: string | number) => {
    const newStages = [...stages]
    newStages[idx] = { ...newStages[idx], [field]: value }
    setStages(newStages)
  }

  // Добавить работу в этап
  const addWorkToStage = (stageIdx: number) => {
    const newStages = [...stages]
    newStages[stageIdx].works.push({ name: '', unit: 'шт', quantity: 1, unitPrice: 0 })
    setStages(newStages)
  }

  // Удалить работу из этапа
  const removeWorkFromStage = (stageIdx: number, workIdx: number) => {
    const newStages = [...stages]
    newStages[stageIdx].works = newStages[stageIdx].works.filter((_, i) => i !== workIdx)
    setStages(newStages)
  }

  // Обновить работу в этапе
  const updateWorkInStage = (stageIdx: number, workIdx: number, field: string, value: string | number) => {
    const newStages = [...stages]
    newStages[stageIdx].works[workIdx] = { ...newStages[stageIdx].works[workIdx], [field]: value }
    setStages(newStages)
  }

  // Импорт работ из наряда в этап
  const importWorksToStage = (stageIdx: number, orderId: string) => {
    if (!orderId) return
    const order = ((data?.orders as {id: string, number: string, name: string, items?: {name: string, unit: string, quantity: number, unitPrice: number}[]}[]) || []).find(o => o.id === orderId)
    if (order && order.items && order.items.length > 0) {
      const newStages = [...stages]
      newStages[stageIdx].works = [...newStages[stageIdx].works, ...order.items]
      setStages(newStages)
      toast.success(`Импортировано ${order.items.length} работ из наряда ${order.number}`)
    } else {
      toast.error('В наряде нет работ для импорта')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const body: Record<string, unknown> = { ...form }
    
    if (type === 'plan') {
      body.startDate = form.startDate || new Date().toISOString()
      body.endDate = form.endDate || new Date().toISOString()
      body.stages = stages.filter(s => s.name) // Добавляем этапы с работами
    }
    
    if (type === 'ks2') {
      body.items = items
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      body.totalAmount = totalAmount
      body.vatAmount = totalAmount * 0.2
      body.totalWithVat = totalAmount * 1.2
      body.period = form.period || new Date().toISOString()
    }
    
    if (type === 'ks3') {
      body.period = form.period || new Date().toISOString()
    }
    
    if (type === 'hiddenAct') {
      body.executedAt = form.executedAt || new Date().toISOString()
    }
    
    if (type === 'salary') {
      body.period = form.period || new Date().toISOString()
    }
    
    if (type === 'order') {
      body.assigneeIds = form.assigneeIds || []
    }
    
    const res = await fetch(endpoints[type], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    
    if (res.ok) {
      toast.success('Запись создана')
      setForm({})
      setItems([])
      setStages([])
      onSuccess()
      onOpenChange(false)
    } else {
      const errorData = await res.json()
      toast.error(errorData.error || 'Ошибка создания')
    }
    setLoading(false)
  }

  const titles: Record<string, string> = {
    direction: 'Новое направление',
    building: 'Новый объект',
    plan: 'Новый план работ',
    employee: 'Новый сотрудник',
    ks2: 'Новый документ КС-2',
    ks3: 'Новый документ КС-3',
    hiddenAct: 'Новый акт скрытых работ',
    order: 'Новый наряд на монтаж',
    salary: 'Начисление зарплаты',
    safety: 'Проведение инструктажа',
  }

  const addItem = () => {
    setItems([...items, { name: '', unit: 'шт', quantity: 1, unitPrice: 0 }])
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{titles[type]}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'direction' && (
            <>
              <div><Label>Название</Label><Input value={form.name as string || ''} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Код</Label><Input value={form.code as string || ''} onChange={(e) => setForm({...form, code: e.target.value})} required /></div>
              <div><Label>Описание</Label><Textarea value={form.description as string || ''} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div><Label>Цвет</Label><Input type="color" value={form.color as string || '#3B82F6'} onChange={(e) => setForm({...form, color: e.target.value})} /></div>
            </>
          )}
          
          {type === 'building' && (
            <>
              <div><Label>Название</Label><Input value={form.name as string || ''} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Адрес</Label><Input value={form.address as string || ''} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Этажей</Label><Input type="number" value={form.floors as string || '1'} onChange={(e) => setForm({...form, floors: e.target.value})} /></div>
                <div><Label>Статус</Label>
                  <Select value={form.status as string || 'ACTIVE'} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Строится</SelectItem>
                      <SelectItem value="COMPLETED">Сдан</SelectItem>
                      <SelectItem value="PLANNED">Планируется</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          
          {type === 'plan' && (
            <>
              <div><Label>Название</Label><Input value={form.name as string || ''} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Номер контракта</Label><Input value={form.contractNumber as string || ''} onChange={(e) => setForm({...form, contractNumber: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Направление</Label>
                  <Select value={form.workDirectionId as string || ''} onValueChange={(v) => setForm({...form, workDirectionId: v})}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      {((data?.directions as {id: string, name: string}[]) || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Объект</Label>
                  <Select value={form.buildingId as string || ''} onValueChange={(v) => setForm({...form, buildingId: v})}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      {((data?.buildings as {id: string, name: string}[]) || []).map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Начало</Label><Input type="date" value={form.startDate as string || ''} onChange={(e) => setForm({...form, startDate: e.target.value})} /></div>
                <div><Label>Окончание</Label><Input type="date" value={form.endDate as string || ''} onChange={(e) => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <div><Label>Сумма (₽)</Label><Input type="number" value={form.totalAmount as string || ''} onChange={(e) => setForm({...form, totalAmount: e.target.value})} /></div>
              
              {/* Этапы и состав работ */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Этапы и состав работ</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStage}><Plus className="w-4 h-4 mr-1" />Добавить этап</Button>
                </div>
                
                {stages.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    Нажмите "Добавить этап" для создания структуры работ
                  </p>
                )}
                
                {stages.map((stage, stageIdx) => (
                  <div key={stageIdx} className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">Этап {stageIdx + 1}</span>
                      <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeStage(stageIdx)}><X className="w-4 h-4" /></Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><Label className="text-xs">Название этапа</Label><Input value={stage.name} onChange={(e) => updateStage(stageIdx, 'name', e.target.value)} placeholder="Название этапа" /></div>
                      <div><Label className="text-xs">Сумма этапа (₽)</Label><Input type="number" value={stage.plannedAmount || ''} onChange={(e) => updateStage(stageIdx, 'plannedAmount', parseFloat(e.target.value) || 0)} placeholder="0" /></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><Label className="text-xs">Начало</Label><Input type="date" value={stage.startDate || ''} onChange={(e) => updateStage(stageIdx, 'startDate', e.target.value)} /></div>
                      <div><Label className="text-xs">Окончание</Label><Input type="date" value={stage.endDate || ''} onChange={(e) => updateStage(stageIdx, 'endDate', e.target.value)} /></div>
                    </div>
                    
                    {/* Состав работ этапа */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium">Состав работ этапа</Label>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addWorkToStage(stageIdx)}><Plus className="w-3 h-3 mr-1" />Добавить</Button>
                        </div>
                      </div>
                      
                      {/* Импорт из наряда в этап */}
                      <div className="flex gap-2 mb-2">
                        <Select value="" onValueChange={(v) => v && importWorksToStage(stageIdx, v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Импорт из наряда..." /></SelectTrigger>
                          <SelectContent>
                            {((data?.orders as {id: string, number: string, name: string, items?: unknown[]}[]) || []).map((o) => (
                              <SelectItem key={o.id} value={o.id}>{o.number} - {o.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {stage.works.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">Нет работ</p>
                      )}
                      
                      {stage.works.length > 0 && (
                        <div className="space-y-2">
                          {stage.works.map((work, workIdx) => (
                            <div key={workIdx} className="grid grid-cols-12 gap-1 items-end">
                              <div className="col-span-5"><Input className="h-8 text-xs" placeholder="Наименование" value={work.name} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'name', e.target.value)} /></div>
                              <div className="col-span-2"><Input className="h-8 text-xs" placeholder="Ед." value={work.unit} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'unit', e.target.value)} /></div>
                              <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Кол-во" value={work.quantity} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'quantity', parseFloat(e.target.value) || 0)} /></div>
                              <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Цена" value={work.unitPrice} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                              <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeWorkFromStage(stageIdx, workIdx)}><X className="w-3 h-3" /></Button></div>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs pt-1 border-t">
                            <span className="text-gray-500">Итого по этапу:</span>
                            <span className="font-medium">{formatCurrency(stage.works.reduce((sum, w) => sum + w.quantity * w.unitPrice, 0))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {stages.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg flex justify-between text-sm">
                    <span className="font-medium">Итого по всем этапам:</span>
                    <span className="font-bold">{formatCurrency(stages.reduce((sum, s) => sum + s.works.reduce((ws, w) => ws + w.quantity * w.unitPrice, 0), 0))}</span>
                  </div>
                )}
              </div>
            </>
          )}
          
          {type === 'employee' && (
            <>
              <div><Label>ФИО</Label><Input value={form.fullName as string || ''} onChange={(e) => setForm({...form, fullName: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Телефон</Label><Input value={form.phone as string || ''} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Должность</Label><Input value={form.position as string || ''} onChange={(e) => setForm({...form, position: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Ставка/мес (₽)</Label><Input type="number" value={form.monthlySalary as string || ''} onChange={(e) => setForm({...form, monthlySalary: e.target.value})} /></div>
                <div><Label>Статус</Label>
                  <Select value={form.status as string || 'ACTIVE'} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Работает</SelectItem>
                      <SelectItem value="VACATION">В отпуске</SelectItem>
                      <SelectItem value="FIRED">Уволен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {type === 'ks2' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Номер документа</Label><Input value={form.number as string || ''} onChange={(e) => setForm({...form, number: e.target.value})} required placeholder="КС-2-001" /></div>
                <div><Label>Период</Label><Input type="month" value={form.period as string || ''} onChange={(e) => setForm({...form, period: e.target.value})} /></div>
              </div>
              <div><Label>План работ</Label>
                <Select value={form.workPlanId as string || ''} onValueChange={(v) => setForm({...form, workPlanId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите план работ" /></SelectTrigger>
                  <SelectContent>
                    {((data?.workPlans as {id: string, name: string}[]) || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Позиции работ</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Добавить вручную</Button>
                  </div>
                </div>
                
                {/* Импорт из наряда */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <Label className="text-blue-800 mb-2 block">Импорт из наряда</Label>
                  <div className="flex gap-2">
                    <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Выберите наряд для импорта" />
                      </SelectTrigger>
                      <SelectContent>
                        {((data?.orders as {id: string, number: string, name: string, status: string}[]) || []).map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.number} - {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="secondary" size="sm" onClick={importFromOrder} disabled={!selectedOrderId}>
                      <Briefcase className="w-4 h-4 mr-1" />Импортировать
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Работы из наряда будут добавлены к существующим позициям</p>
                </div>
                
                {items.length === 0 && <p className="text-sm text-gray-500">Добавьте позиции вручную или импортируйте из наряда</p>}
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-5"><Input placeholder="Наименование" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Ед." value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="Кол-во" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="Цена" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}><X className="w-4 h-4" /></Button></div>
                  </div>
                ))}
                {items.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm"><span>Сумма без НДС:</span><span>{formatCurrency(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span></div>
                    <div className="flex justify-between text-sm"><span>НДС (20%):</span><span>{formatCurrency(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 0.2)}</span></div>
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Итого с НДС:</span><span>{formatCurrency(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 1.2)}</span></div>
                  </div>
                )}
              </div>
            </>
          )}

          {type === 'ks3' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Номер документа</Label><Input value={form.number as string || ''} onChange={(e) => setForm({...form, number: e.target.value})} required placeholder="КС-3-001" /></div>
                <div><Label>Период</Label><Input type="month" value={form.period as string || ''} onChange={(e) => setForm({...form, period: e.target.value})} /></div>
              </div>
              <div><Label>План работ</Label>
                <Select value={form.workPlanId as string || ''} onValueChange={(v) => setForm({...form, workPlanId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите план работ" /></SelectTrigger>
                  <SelectContent>
                    {((data?.workPlans as {id: string, name: string}[]) || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Документ КС-2</Label>
                <Select value={form.ks2Id as string || ''} onValueChange={(v) => setForm({...form, ks2Id: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите КС-2" /></SelectTrigger>
                  <SelectContent>
                    {((data?.documentsKS2 as {id: string, number: string}[]) || []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Примечания</Label><Textarea value={form.notes as string || ''} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
            </>
          )}

          {type === 'hiddenAct' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Номер акта</Label><Input value={form.number as string || ''} onChange={(e) => setForm({...form, number: e.target.value})} required placeholder="АСР-001" /></div>
                <div><Label>Дата выполнения</Label><Input type="date" value={form.executedAt as string || ''} onChange={(e) => setForm({...form, executedAt: e.target.value})} /></div>
              </div>
              <div><Label>План работ</Label>
                <Select value={form.workPlanId as string || ''} onValueChange={(v) => setForm({...form, workPlanId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите план работ" /></SelectTrigger>
                  <SelectContent>
                    {((data?.workPlans as {id: string, name: string}[]) || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Наименование работ</Label><Input value={form.name as string || ''} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Описание</Label><Textarea value={form.description as string || ''} onChange={(e) => setForm({...form, description: e.target.value})} required /></div>
              <div><Label>Место проведения</Label><Input value={form.location as string || ''} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="Корпус 1, этаж 5, помещение 23" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Представитель подрядчика</Label><Input value={form.contractorName as string || ''} onChange={(e) => setForm({...form, contractorName: e.target.value})} placeholder="ФИО" /></div>
                <div><Label>Должность</Label><Input value={form.contractorPosition as string || ''} onChange={(e) => setForm({...form, contractorPosition: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Представитель заказчика</Label><Input value={form.customerName as string || ''} onChange={(e) => setForm({...form, customerName: e.target.value})} placeholder="ФИО" /></div>
                <div><Label>Должность</Label><Input value={form.customerPosition as string || ''} onChange={(e) => setForm({...form, customerPosition: e.target.value})} /></div>
              </div>
            </>
          )}

          {type === 'order' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Номер наряда</Label><Input value={form.number as string || ''} onChange={(e) => setForm({...form, number: e.target.value})} required placeholder="НМ-001" /></div>
                <div><Label>Срок выполнения</Label><Input type="date" value={form.deadline as string || ''} onChange={(e) => setForm({...form, deadline: e.target.value})} /></div>
              </div>
              <div><Label>План работ</Label>
                <Select value={form.workPlanId as string || ''} onValueChange={(v) => setForm({...form, workPlanId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите план работ" /></SelectTrigger>
                  <SelectContent>
                    {((data?.workPlans as {id: string, name: string}[]) || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Наименование работ</Label><Input value={form.name as string || ''} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Описание</Label><Textarea value={form.description as string || ''} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div><Label>Место проведения</Label><Input value={form.location as string || ''} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="Корпус 1, этаж 5" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Приоритет</Label>
                  <Select value={String(form.priority || '2')} onValueChange={(v) => setForm({...form, priority: parseInt(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Низкий</SelectItem>
                      <SelectItem value="2">Средний</SelectItem>
                      <SelectItem value="3">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Статус</Label>
                  <Select value={form.status as string || 'DRAFT'} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Черновик</SelectItem>
                      <SelectItem value="ASSIGNED">Назначен</SelectItem>
                      <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Исполнители</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {((data?.employees as {id: string, fullName: string, status: string}[]) || []).filter(e => e.status === 'ACTIVE').map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={((form.assigneeIds as string[]) || []).includes(emp.id)}
                        onChange={(e) => {
                          const current = (form.assigneeIds as string[]) || []
                          if (e.target.checked) {
                            setForm({...form, assigneeIds: [...current, emp.id]})
                          } else {
                            setForm({...form, assigneeIds: current.filter(id => id !== emp.id)})
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{emp.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === 'salary' && (
            <>
              <div><Label>Сотрудник</Label>
                <Select value={form.employeeId as string || ''} onValueChange={(v) => setForm({...form, employeeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
                  <SelectContent>
                    {((data?.employees as {id: string, fullName: string, status: string, monthlySalary: number}[]) || []).filter(e => e.status === 'ACTIVE').map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Период</Label><Input type="month" value={form.period as string || ''} onChange={(e) => setForm({...form, period: e.target.value})} /></div>
                <div><Label>Рабочих дней</Label><Input type="number" value={form.workDays as string || '22'} onChange={(e) => setForm({...form, workDays: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Базовая сумма (₽)</Label><Input type="number" value={form.baseAmount as string || ''} onChange={(e) => setForm({...form, baseAmount: e.target.value})} /></div>
                <div><Label>Премия (₽)</Label><Input type="number" value={form.bonus as string || '0'} onChange={(e) => setForm({...form, bonus: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Удержания (₽)</Label><Input type="number" value={form.deductions as string || '0'} onChange={(e) => setForm({...form, deductions: e.target.value})} /></div>
                <div><Label>Примечания</Label><Input value={form.notes as string || ''} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
              </div>
            </>
          )}

          {type === 'safety' && (
            <>
              <div><Label>Инструктаж</Label>
                <Select value={form.briefingId as string || ''} onValueChange={(v) => setForm({...form, briefingId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите вид инструктажа" /></SelectTrigger>
                  <SelectContent>
                    {((data?.briefings as {id: string, name: string}[]) || []).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Сотрудник</Label>
                <Select value={form.employeeId as string || ''} onValueChange={(v) => setForm({...form, employeeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
                  <SelectContent>
                    {((data?.employees as {id: string, fullName: string, status: string}[]) || []).filter(e => e.status === 'ACTIVE').map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Дата</Label><Input type="date" value={form.date as string || ''} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
              <div><Label>Результат</Label>
                <Select value={form.result as string || 'прошел'} onValueChange={(v) => setForm({...form, result: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="прошел">Прошел</SelectItem>
                    <SelectItem value="не прошел">Не прошел</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Примечания</Label><Textarea value={form.notes as string || ''} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
            </>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== ДАШБОРД ====================
function DashboardSection() {
  const dashboard = useAppStore((s) => s.dashboard)
  const orders = useAppStore((s) => s.orders)

  if (!dashboard) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Дашборд</h1>
          <p className="text-gray-500">Обзор проектов</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {formatDate(new Date())}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Активные проекты</p>
                <p className="text-2xl font-bold">{dashboard.overview.activePlans}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Контракты</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard.amounts.totalContracts)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Персонал</p>
                <p className="text-2xl font-bold">{dashboard.overview.activeEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">К выплате</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard.overview.totalSalaryAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">По направлениям</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {dashboard.directions.map((dir) => (
              <div key={dir.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dir.color }} />
                    <span className="font-medium">{dir.name}</span>
                  </div>
                  <span className="text-gray-500">{dir.plansCount} проектов</span>
                </div>
                <Progress value={dir.totalAmount > 0 ? (dir.totalAmount / dashboard.amounts.totalContracts) * 100 : 0} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Активные наряды</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {orders?.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">{order.number}</p>
                    <p className="text-sm text-gray-500">{order.name}</p>
                  </div>
                </div>
                <Badge className={statusColors.order[order.status]}>{statusLabels.order[order.status]}</Badge>
              </div>
            ))}
            {(!orders || orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length === 0) && (
              <p className="text-gray-500 text-center py-4">Нет активных нарядов</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== НАПРАВЛЕНИЯ ====================
type DirectionType = {
  id: string
  name: string
  code: string
  description?: string
  color: string
  _count?: { workPlans: number }
}

function DirectionsSection() {
  const { directions, setDirections } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDirection, setEditDirection] = useState<DirectionType | null>(null)
  const [deleteDirection, setDeleteDirection] = useState<DirectionType | null>(null)

  const fetchData = () => {
    fetch('/api/directions').then(res => res.json()).then(data => { setDirections(data); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (dir: DirectionType) => {
    const plansCount = dir._count?.workPlans || 0
    if (!confirm(`Удалить направление "${dir.name}"?${plansCount > 0 ? `\n\nВнимание! К этому направлению привязано ${plansCount} проект(ов). Они также будут удалены.` : ''}`)) return
    
    const res = await fetch(`/api/directions/${dir.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Направление удалено')
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'Ошибка удаления')
    }
    setDeleteDirection(null)
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Направления работ</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {directions.map((d) => (
          <Card key={d.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}>
                  {d.code === 'СС' && <Network className="w-6 h-6" style={{ color: d.color }} />}
                  {d.code === 'АСПЗ' && <Flame className="w-6 h-6" style={{ color: d.color }} />}
                  {d.code === 'АСВ' && <Wind className="w-6 h-6" style={{ color: d.color }} />}
                </div>
                <Badge variant="outline">{d.code}</Badge>
              </div>
              <CardTitle className="text-lg mt-3">{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{d.description || 'Нет описания'}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{d._count?.workPlans || 0} проектов</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditDirection(d)}>
                    <Edit className="w-4 h-4 mr-1" />Изменить
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteDirection(d)}>
                    <Trash2 className="w-4 h-4 mr-1" />Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateDialog type="direction" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} />

      {/* Диалог редактирования направления */}
      <Dialog open={!!editDirection} onOpenChange={() => setEditDirection(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Редактирование направления</DialogTitle></DialogHeader>
          {editDirection && (
            <EditDirectionForm direction={editDirection} onClose={() => setEditDirection(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteDirection} onOpenChange={() => setDeleteDirection(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Подтверждение удаления</DialogTitle></DialogHeader>
          {deleteDirection && (
            <div className="space-y-4">
              <p>Вы уверены, что хотите удалить направление <strong>"{deleteDirection.name}"</strong>?</p>
              {(deleteDirection._count?.workPlans || 0) > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  ⚠️ К этому направлению привязано {deleteDirection._count?.workPlans} проект(ов). Они также будут удалены!
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDirection(null)}>Отмена</Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteDirection)}>Удалить</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования направления
function EditDirectionForm({ direction, onClose, onSuccess }: { direction: DirectionType; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(direction.name)
  const [code, setCode] = useState(direction.code)
  const [description, setDescription] = useState(direction.description || '')
  const [color, setColor] = useState(direction.color)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/directions/${direction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code, description, color }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Направление обновлено')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div><Label>Название</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><Label>Код</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
      <div><Label>Описание</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
      <div><Label>Цвет</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10" /></div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== ОБЪЕКТЫ ====================
type BuildingType = {
  id: string
  name: string
  address?: string
  floors: number
  status: string
  _count?: { workPlans: number }
}

function BuildingsSection() {
  const { buildings, setBuildings } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editBuilding, setEditBuilding] = useState<BuildingType | null>(null)
  const [deleteBuilding, setDeleteBuilding] = useState<BuildingType | null>(null)

  const fetchData = () => {
    fetch('/api/buildings').then(res => res.json()).then(data => { setBuildings(data); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (bld: BuildingType) => {
    const plansCount = bld._count?.workPlans || 0
    if (!confirm(`Удалить объект "${bld.name}"?${plansCount > 0 ? `\n\nВнимание! К этому объекту привязано ${plansCount} проект(ов). Они также будут удалены.` : ''}`)) return
    
    const res = await fetch(`/api/buildings/${bld.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Объект удален')
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'Ошибка удаления')
    }
    setDeleteBuilding(null)
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Объекты строительства</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((b) => (
          <Card key={b.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-600" />
                </div>
                <Badge className={statusColors.building[b.status]}>{statusLabels.building[b.status]}</Badge>
              </div>
              <CardTitle className="text-lg mt-3">{b.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Адрес:</span><span>{b.address || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Этажей:</span><span>{b.floors}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-gray-500">{b._count?.workPlans || 0} проектов</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditBuilding(b)} title="Редактировать"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleteBuilding(b)} title="Удалить"><X className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateDialog type="building" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} />

      {/* Диалог редактирования объекта */}
      <Dialog open={!!editBuilding} onOpenChange={() => setEditBuilding(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Редактирование объекта</DialogTitle></DialogHeader>
          {editBuilding && (
            <EditBuildingForm building={editBuilding} onClose={() => setEditBuilding(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteBuilding} onOpenChange={() => setDeleteBuilding(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Подтверждение удаления</DialogTitle></DialogHeader>
          {deleteBuilding && (
            <div className="space-y-4">
              <p>Вы уверены, что хотите удалить объект <strong>"{deleteBuilding.name}"</strong>?</p>
              {(deleteBuilding._count?.workPlans || 0) > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  ⚠️ К этому объекту привязано {deleteBuilding._count?.workPlans} проект(ов). Они также будут удалены!
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteBuilding(null)}>Отмена</Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteBuilding)}>Удалить</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования объекта
function EditBuildingForm({ building, onClose, onSuccess }: { building: BuildingType; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(building.name)
  const [address, setAddress] = useState(building.address || '')
  const [floors, setFloors] = useState(building.floors)
  const [status, setStatus] = useState(building.status)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/buildings/${building.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, floors, status }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Объект обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div><Label>Название</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><Label>Адрес</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
      <div><Label>Этажей</Label><Input type="number" value={floors} onChange={(e) => setFloors(parseInt(e.target.value) || 1)} /></div>
      <div><Label>Статус</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Строится</SelectItem>
            <SelectItem value="COMPLETED">Сдан</SelectItem>
            <SelectItem value="PLANNED">Планируется</SelectItem>
            <SelectItem value="SUSPENDED">Приостановлен</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== ПЛАН РАБОТ ====================
function PlansSection() {
  const { workPlans, setWorkPlans, directions, setDirections, buildings, setBuildings, orders, setOrders } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table')
  const [viewPlan, setViewPlan] = useState<WorkPlan | null>(null)
  const [editPlan, setEditPlan] = useState<WorkPlan | null>(null)

  const fetchData = () => {
    Promise.all([
      fetch('/api/plans').then(r => r.json()),
      fetch('/api/directions').then(r => r.json()),
      fetch('/api/buildings').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ]).then(([plans, dirs, builds, ords]) => {
      setWorkPlans(plans)
      setDirections(dirs)
      setBuildings(builds)
      setOrders(ords)
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить план работ?')) return
    const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('План работ удален')
      fetchData()
    } else {
      toast.error('Ошибка удаления')
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  const filteredPlans = filterStatus === 'all' ? workPlans : workPlans.filter(p => p.status === filterStatus)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">План работ</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Создать план</Button>
      </div>

      <div className="flex items-center gap-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="all">Все статусы</option>
          <option value="IN_PROGRESS">В работе</option>
          <option value="COMPLETED">Завершенные</option>
          <option value="APPROVED">Согласованные</option>
        </select>

        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 text-sm flex items-center gap-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            <Table className="w-4 h-4" />
            Таблица
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`px-3 py-2 text-sm flex items-center gap-2 ${viewMode === 'gantt' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            <GanttChart className="w-4 h-4" />
            Диаграмма Ганта
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-500">Название</th>
                    <th className="text-left p-4 font-medium text-gray-500">Объект</th>
                    <th className="text-right p-4 font-medium text-gray-500">Сумма</th>
                    <th className="text-center p-4 font-medium text-gray-500">Статус</th>
                    <th className="text-center p-4 font-medium text-gray-500">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPlans.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.workDirection?.color || '#gray' }} />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.workDirection?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{p.building?.name}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(p.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <Badge className={statusColors.workPlan[p.status]}>{statusLabels.workPlan[p.status]}</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setViewPlan(p)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditPlan(p)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(p.id)}><X className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GanttChartView plans={filteredPlans} />
      )}

      <CreateDialog 
        type="plan" 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSuccess={fetchData}
        data={{ directions, buildings, orders }}
      />

      {/* Диалог просмотра плана */}
      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>План работ: {viewPlan?.name}</DialogTitle></DialogHeader>
          {viewPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-500">Направление</Label><p className="font-medium">{viewPlan.workDirection?.name}</p></div>
                <div><Label className="text-gray-500">Объект</Label><p className="font-medium">{viewPlan.building?.name}</p></div>
                <div><Label className="text-gray-500">Номер контракта</Label><p className="font-medium">{viewPlan.contractNumber || '-'}</p></div>
                <div><Label className="text-gray-500">Статус</Label><p><Badge className={statusColors.workPlan[viewPlan.status]}>{statusLabels.workPlan[viewPlan.status]}</Badge></p></div>
                <div><Label className="text-gray-500">Дата начала</Label><p className="font-medium">{formatDate(viewPlan.startDate)}</p></div>
                <div><Label className="text-gray-500">Дата окончания</Label><p className="font-medium">{formatDate(viewPlan.endDate)}</p></div>
              </div>
              <div className="pt-4 border-t">
                <Label className="text-gray-500">Сумма</Label>
                <p className="text-2xl font-bold">{formatCurrency(viewPlan.totalAmount)}</p>
              </div>
              {viewPlan.notes && (
                <div><Label className="text-gray-500">Примечания</Label><p className="mt-1">{viewPlan.notes}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPlan(null)}>Закрыть</Button>
            <Button onClick={() => { setEditPlan(viewPlan); setViewPlan(null) }}>Редактировать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования плана */}
      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Редактирование плана работ</DialogTitle></DialogHeader>
          {editPlan && (
            <EditPlanForm plan={editPlan} onClose={() => setEditPlan(null)} onSuccess={fetchData} directions={directions} buildings={buildings} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования плана работ
type EditStageType = {
  id?: string
  name: string
  description?: string
  startDate?: string | null
  endDate?: string | null
  plannedAmount?: number
  status?: string
  works: { id?: string; name: string; unit: string; quantity: number; unitPrice: number }[]
}

function EditPlanForm({ plan, onClose, onSuccess, directions, buildings }: { plan: WorkPlan; onClose: () => void; onSuccess: () => void; directions: unknown[]; buildings: unknown[] }) {
  const [name, setName] = useState(plan.name)
  const [contractNumber, setContractNumber] = useState(plan.contractNumber || '')
  const [totalAmount, setTotalAmount] = useState(plan.totalAmount)
  const [status, setStatus] = useState(plan.status)
  const [notes, setNotes] = useState(plan.notes || '')
  const [loading, setLoading] = useState(false)
  const [stages, setStages] = useState<EditStageType[]>(
    (plan.stages || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : null,
      endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : null,
      plannedAmount: s.plannedAmount || 0,
      status: s.status,
      works: (s.works || []).map((w: { id?: string; name: string; unit: string; quantity: number; unitPrice: number }) => ({
        id: w.id,
        name: w.name,
        unit: w.unit || 'шт',
        quantity: w.quantity || 1,
        unitPrice: w.unitPrice || 0
      }))
    }))
  )

  // Добавить этап
  const addStage = () => {
    setStages([...stages, { name: '', works: [] }])
  }

  // Удалить этап
  const removeStage = (idx: number) => {
    setStages(stages.filter((_, i) => i !== idx))
  }

  // Обновить этап
  const updateStage = (idx: number, field: string, value: string | number) => {
    const newStages = [...stages]
    newStages[idx] = { ...newStages[idx], [field]: value }
    setStages(newStages)
  }

  // Добавить работу в этап
  const addWorkToStage = (stageIdx: number) => {
    const newStages = [...stages]
    newStages[stageIdx].works.push({ name: '', unit: 'шт', quantity: 1, unitPrice: 0 })
    setStages(newStages)
  }

  // Удалить работу из этапа
  const removeWorkFromStage = (stageIdx: number, workIdx: number) => {
    const newStages = [...stages]
    newStages[stageIdx].works = newStages[stageIdx].works.filter((_, i) => i !== workIdx)
    setStages(newStages)
  }

  // Обновить работу в этапе
  const updateWorkInStage = (stageIdx: number, workIdx: number, field: string, value: string | number) => {
    const newStages = [...stages]
    newStages[stageIdx].works[workIdx] = { ...newStages[stageIdx].works[workIdx], [field]: value }
    setStages(newStages)
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        contractNumber, 
        totalAmount: Number(totalAmount), 
        status, 
        notes,
        stages: stages.filter(s => s.name)
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('План работ обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div><Label>Название</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><Label>Номер контракта</Label><Input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} /></div>
      <div><Label>Сумма (₽)</Label><Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} /></div>
      <div><Label>Статус</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Черновик</SelectItem>
            <SelectItem value="APPROVED">Согласован</SelectItem>
            <SelectItem value="IN_PROGRESS">В работе</SelectItem>
            <SelectItem value="COMPLETED">Завершен</SelectItem>
            <SelectItem value="CANCELLED">Отменен</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Примечания</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
      
      {/* Этапы и состав работ */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-semibold">Этапы и состав работ</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStage}><Plus className="w-4 h-4 mr-1" />Добавить этап</Button>
        </div>
        
        {stages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            Нажмите "Добавить этап" для создания структуры работ
          </p>
        )}
        
        {stages.map((stage, stageIdx) => (
          <div key={stageIdx} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">Этап {stageIdx + 1}</span>
              <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeStage(stageIdx)}><X className="w-4 h-4" /></Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><Label className="text-xs">Название этапа</Label><Input value={stage.name} onChange={(e) => updateStage(stageIdx, 'name', e.target.value)} placeholder="Название этапа" /></div>
              <div><Label className="text-xs">Сумма этапа (₽)</Label><Input type="number" value={stage.plannedAmount || ''} onChange={(e) => updateStage(stageIdx, 'plannedAmount', parseFloat(e.target.value) || 0)} placeholder="0" /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><Label className="text-xs">Начало</Label><Input type="date" value={stage.startDate || ''} onChange={(e) => updateStage(stageIdx, 'startDate', e.target.value)} /></div>
              <div><Label className="text-xs">Окончание</Label><Input type="date" value={stage.endDate || ''} onChange={(e) => updateStage(stageIdx, 'endDate', e.target.value)} /></div>
            </div>
            
            {/* Состав работ этапа */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Состав работ этапа</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addWorkToStage(stageIdx)}><Plus className="w-3 h-3 mr-1" />Добавить</Button>
              </div>
              
              {stage.works.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">Нет работ</p>
              )}
              
              {stage.works.length > 0 && (
                <div className="space-y-2">
                  {stage.works.map((work, workIdx) => (
                    <div key={workIdx} className="grid grid-cols-12 gap-1 items-end">
                      <div className="col-span-5"><Input className="h-8 text-xs" placeholder="Наименование" value={work.name} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'name', e.target.value)} /></div>
                      <div className="col-span-2"><Input className="h-8 text-xs" placeholder="Ед." value={work.unit} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'unit', e.target.value)} /></div>
                      <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Кол-во" value={work.quantity} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'quantity', parseFloat(e.target.value) || 0)} /></div>
                      <div className="col-span-2"><Input className="h-8 text-xs" type="number" placeholder="Цена" value={work.unitPrice} onChange={(e) => updateWorkInStage(stageIdx, workIdx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                      <div className="col-span-1"><Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeWorkFromStage(stageIdx, workIdx)}><X className="w-3 h-3" /></Button></div>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs pt-1 border-t">
                    <span className="text-gray-500">Итого по этапу:</span>
                    <span className="font-medium">{formatCurrency(stage.works.reduce((sum, w) => sum + w.quantity * w.unitPrice, 0))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {stages.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg flex justify-between text-sm">
            <span className="font-medium">Итого по всем этапам:</span>
            <span className="font-bold">{formatCurrency(stages.reduce((sum, s) => sum + s.works.reduce((ws, w) => ws + w.quantity * w.unitPrice, 0), 0))}</span>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// Компонент диаграммы Ганта
function GanttChartView({ plans }: { plans: unknown[] }) {
  type PlanType = {
    id: string
    name: string
    startDate: string
    endDate: string
    status: string
    workDirection?: { color?: string; name?: string }
    building?: { name?: string }
    stages?: Array<{
      id: string
      name: string
      startDate: string
      endDate: string
      status: string
      percentComplete: number
      plannedAmount: number
      actualAmount: number
    }>
  }
  
  const typedPlans = plans as PlanType[]
  
  // Определяем диапазон дат
  const allDates: Date[] = []
  typedPlans.forEach(plan => {
    if (plan.startDate) allDates.push(new Date(plan.startDate))
    if (plan.endDate) allDates.push(new Date(plan.endDate))
    plan.stages?.forEach(stage => {
      if (stage.startDate) allDates.push(new Date(stage.startDate))
      if (stage.endDate) allDates.push(new Date(stage.endDate))
    })
  })
  
  if (allDates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Нет данных для отображения диаграммы
        </CardContent>
      </Card>
    )
  }
  
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  
  // Добавляем отступы
  minDate.setDate(minDate.getDate() - 7)
  maxDate.setDate(maxDate.getDate() + 7)
  
  // Генерируем месяцы для заголовка
  const months: Date[] = []
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  while (current <= maxDate) {
    months.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  
  const getDatePosition = (date: Date): number => {
    const days = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    return (days / totalDays) * 100
  }
  
  const getBarWidth = (start: Date, end: Date): number => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return (days / totalDays) * 100
  }
  
  const stageStatusColors: Record<string, string> = {
    PENDING: 'bg-gray-300',
    IN_PROGRESS: 'bg-blue-400',
    COMPLETED: 'bg-green-500',
    PAUSED: 'bg-yellow-400',
  }
  
  const planStatusColors: Record<string, string> = {
    DRAFT: 'bg-gray-400',
    APPROVED: 'bg-blue-500',
    IN_PROGRESS: 'bg-orange-500',
    COMPLETED: 'bg-green-600',
  }

  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Заголовок с месяцами */}
            <div className="flex border-b bg-gray-50">
              <div className="w-64 flex-shrink-0 p-3 font-medium text-sm text-gray-500 border-r">
                Проект / Этап
              </div>
              <div className="flex-1 relative h-8">
                {months.map((month, idx) => {
                  const startPos = getDatePosition(new Date(month.getFullYear(), month.getMonth(), 1))
                  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1)
                  const endPos = getDatePosition(nextMonth)
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 flex items-center justify-center text-xs text-gray-500 border-l"
                      style={{ left: `${startPos}%`, width: `${endPos - startPos}%` }}
                    >
                      {monthNames[month.getMonth()]} {month.getFullYear()}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Строки проектов и этапов */}
            <div className="divide-y">
              {typedPlans.map((plan) => (
                <div key={plan.id}>
                  {/* Строка проекта */}
                  <div className="flex hover:bg-gray-50">
                    <div className="w-64 flex-shrink-0 p-3 border-r">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: plan.workDirection?.color || '#6b7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{plan.name}</p>
                          <p className="text-xs text-gray-400">{plan.building?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-12 bg-gray-50/50">
                      {/* Сетка месяцев */}
                      {months.map((month, idx) => {
                        const startPos = getDatePosition(new Date(month.getFullYear(), month.getMonth(), 1))
                        return (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 border-l border-gray-200"
                            style={{ left: `${startPos}%` }}
                          />
                        )
                      })}
                      {/* Бар проекта */}
                      {plan.startDate && plan.endDate && (
                        <div
                          className={`absolute top-2 bottom-2 rounded-md ${planStatusColors[plan.status] || 'bg-gray-400'} flex items-center px-2`}
                          style={{
                            left: `${getDatePosition(new Date(plan.startDate))}%`,
                            width: `${getBarWidth(new Date(plan.startDate), new Date(plan.endDate))}%`,
                            minWidth: '20px'
                          }}
                        >
                          <span className="text-xs text-white font-medium truncate">
                            {formatCurrency(plan.stages?.reduce((sum, s) => sum + (s.plannedAmount || 0), 0) || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Строки этапов */}
                  {plan.stages?.map((stage) => (
                    <div key={stage.id} className="flex hover:bg-blue-50/30">
                      <div className="w-64 flex-shrink-0 p-3 pl-8 border-r">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{stage.name}</p>
                          <span className="text-xs text-gray-400 ml-2">{stage.percentComplete}%</span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-10">
                        {/* Сетка месяцев */}
                        {months.map((month, idx) => {
                          const startPos = getDatePosition(new Date(month.getFullYear(), month.getMonth(), 1))
                          return (
                            <div
                              key={idx}
                              className="absolute top-0 bottom-0 border-l border-gray-100"
                              style={{ left: `${startPos}%` }}
                            />
                          )
                        })}
                        {/* Бар этапа */}
                        {stage.startDate && stage.endDate && (
                          <>
                            {/* Фоновый бар */}
                            <div
                              className="absolute top-2 bottom-2 rounded bg-gray-200"
                              style={{
                                left: `${getDatePosition(new Date(stage.startDate))}%`,
                                width: `${getBarWidth(new Date(stage.startDate), new Date(stage.endDate))}%`,
                                minWidth: '10px'
                              }}
                            />
                            {/* Бар прогресса */}
                            <div
                              className={`absolute top-2 bottom-2 rounded ${stageStatusColors[stage.status] || 'bg-gray-300'}`}
                              style={{
                                left: `${getDatePosition(new Date(stage.startDate))}%`,
                                width: `${getBarWidth(new Date(stage.startDate), new Date(stage.endDate)) * (stage.percentComplete / 100)}%`,
                                minWidth: stage.percentComplete > 0 ? '5px' : '0'
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Легенда */}
            <div className="flex items-center gap-6 p-4 border-t bg-gray-50 text-sm">
              <span className="text-gray-500">Статусы этапов:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gray-300" />
                <span>Ожидает</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-blue-400" />
                <span>В работе</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-green-500" />
                <span>Завершён</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-yellow-400" />
                <span>Приостановлен</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== КС-2 ====================
function KS2Section() {
  const { documentsKS2, setDocumentsKS2, workPlans, setWorkPlans, orders, setOrders } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDoc, setViewDoc] = useState<typeof documentsKS2[0] | null>(null)
  const [editDoc, setEditDoc] = useState<typeof documentsKS2[0] | null>(null)

  const fetchData = () => {
    Promise.all([
      fetch('/api/documents/ks2').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ]).then(([docs, plans, ords]) => { setDocumentsKS2(docs); setWorkPlans(plans); setOrders(ords); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить документ? Это действие нельзя отменить.')) return
    const res = await fetch(`/api/documents/ks2/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Документ удален')
      fetchData()
    } else {
      const error = await res.json()
      toast.error(error.error || 'Ошибка удаления')
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Документы КС-2</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Создать КС-2</Button>
      </div>

      <div className="grid gap-4">
        {documentsKS2.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{doc.number}</p>
                    <p className="text-gray-500">{doc.workPlan?.name}</p>
                    <p className="text-sm text-gray-400">Период: {formatDate(doc.period)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(doc.totalWithVat)}</p>
                  <Badge className={statusColors.document[doc.status]}>{statusLabels.document[doc.status]}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewDoc(doc)}><Eye className="w-4 h-4 mr-1" />Просмотр</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditDoc(doc)}><Edit className="w-4 h-4 mr-1" />Изменить</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(doc.id)}><X className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {documentsKS2.length === 0 && (
          <Card><CardContent className="p-8 text-center text-gray-500">Нет документов КС-2</CardContent></Card>
        )}
      </div>

      <CreateDialog type="ks2" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} data={{ workPlans, orders }} />

      {/* Диалог просмотра КС-2 */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Документ {viewDoc?.number}</DialogTitle></DialogHeader>
          {viewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">План работ</Label>
                  <p className="font-medium">{viewDoc.workPlan?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Период</Label>
                  <p className="font-medium">{formatDate(viewDoc.period)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Статус</Label>
                  <p><Badge className={statusColors.document[viewDoc.status]}>{statusLabels.document[viewDoc.status]}</Badge></p>
                </div>
                <div>
                  <Label className="text-gray-500">Дата создания</Label>
                  <p className="font-medium">{formatDate(viewDoc.createdAt)}</p>
                </div>
              </div>

              {viewDoc.items && viewDoc.items.length > 0 && (
                <div>
                  <Label className="text-gray-500 mb-2 block">Позиции работ</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-500">№</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-500">Наименование</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-500">Ед.</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-500">Кол-во</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-500">Цена</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-500">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {viewDoc.items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3 text-sm">{idx + 1}</td>
                            <td className="p-3 text-sm">{item.name}</td>
                            <td className="p-3 text-sm text-center">{item.unit}</td>
                            <td className="p-3 text-sm text-right">{item.quantity}</td>
                            <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Сумма без НДС:</span><span>{formatCurrency(viewDoc.totalAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">НДС (20%):</span><span>{formatCurrency(viewDoc.vatAmount)}</span></div>
                  <div className="flex justify-between font-bold"><span>Итого с НДС:</span><span>{formatCurrency(viewDoc.totalWithVat)}</span></div>
                </div>
              </div>

              {viewDoc.notes && (
                <div>
                  <Label className="text-gray-500">Примечания</Label>
                  <p className="text-sm mt-1">{viewDoc.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDoc(null)}>Закрыть</Button>
            <Button onClick={() => {
              const printWindow = window.open('', '_blank')
              if (printWindow && viewDoc) {
                const itemsHtml = (viewDoc.items || []).map((item, idx) => 
                  `<tr>
                    <td align="center">${idx + 1}</td>
                    <td>${item.name}</td>
                    <td align="center">${item.unit}</td>
                    <td align="right">${item.quantity.toLocaleString('ru-RU')}</td>
                    <td align="right">${item.unitPrice.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                    <td align="right">${item.totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                  </tr>`
                ).join('')
                
                printWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="UTF-8">
                    <title>Форма КС-2 № ${viewDoc.number}</title>
                    <style>
                      @page { size: A4; margin: 10mm; }
                      body { font-family: "Times New Roman", Times, serif; font-size: 10pt; line-height: 1.2; }
                      table { border-collapse: collapse; width: 100%; }
                      th, td { border: 1px solid black; padding: 2mm 3mm; }
                      .no-border { border: none; }
                      .no-border td, .no-border th { border: none; padding: 1mm 2mm; }
                      .header-table td { border: none; }
                      .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 5mm 0; }
                      .subtitle { text-align: center; font-size: 11pt; margin: 3mm 0; }
                      .code-row { font-size: 8pt; }
                      .code-row td { padding: 0 2mm; border: none; }
                      .small { font-size: 8pt; }
                      .right { text-align: right; }
                      .center { text-align: center; }
                      .bold { font-weight: bold; }
                      .underline { border-bottom: 1px solid black; min-width: 50mm; display: inline-block; }
                      .signature-table { margin-top: 10mm; }
                      .signature-table td { border: none; padding: 3mm 5mm; }
                      .signature-line { border-bottom: 1px solid black; min-width: 40mm; display: inline-block; }
                    </style>
                  </head>
                  <body>
                    <!-- Шапка организации -->
                    <table class="no-border header-table" style="margin-bottom: 5mm;">
                      <tr>
                        <td style="width: 50%;">
                          <div style="font-weight: bold;">ООО "СтройКомплект"</div>
                          <div class="small">ИНН 7701234567 / КПП 770101001</div>
                          <div class="small">123456, г. Москва, ул. Строителей, д. 1</div>
                        </td>
                        <td style="width: 25%;" class="small">
                          <div>Код по ОКПО</div>
                          <div style="border-bottom: 1px solid black; text-align: center;">45678901</div>
                        </td>
                        <td style="width: 25%;" class="small">
                          <div>Номер документа</div>
                          <div style="border-bottom: 1px solid black; text-align: center;">${viewDoc.number}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Коды -->
                    <table class="no-border code-row" style="margin-bottom: 3mm;">
                      <tr>
                        <td>Форма по ОКУД</td>
                        <td style="border: 1px solid black; width: 25mm; text-align: center;">0322005</td>
                        <td style="width: 20mm;"></td>
                        <td>Дата составления</td>
                        <td style="border: 1px solid black; width: 35mm; text-align: center;">${formatDate(viewDoc.createdAt)}</td>
                      </tr>
                    </table>

                    <!-- Заказчик -->
                    <table class="no-border" style="margin-bottom: 3mm; font-size: 9pt;">
                      <tr>
                        <td style="width: 25mm;">Заказчик</td>
                        <td style="border-bottom: 1px solid black;">ООО "Заказчик-Инвестор"</td>
                        <td style="width: 5mm;"></td>
                        <td class="small" style="width: 20mm;">по ОКПО</td>
                        <td style="border-bottom: 1px solid black; width: 40mm;"></td>
                      </tr>
                    </table>

                    <!-- Название объекта -->
                    <table class="no-border" style="margin-bottom: 5mm; font-size: 9pt;">
                      <tr>
                        <td style="width: 60mm;">Наименование объекта</td>
                        <td style="border-bottom: 1px solid black;">${viewDoc.workPlan?.name || '-'}</td>
                      </tr>
                    </table>

                    <!-- Заголовок -->
                    <div class="title">АКТ<br>о приемке выполненных работ</div>
                    <div class="subtitle">Форма № КС-2</div>

                    <!-- Информация о договоре -->
                    <table class="no-border" style="margin-bottom: 5mm; font-size: 9pt;">
                      <tr>
                        <td style="width: 50mm;">Номер договора</td>
                        <td style="border-bottom: 1px solid black; width: 45mm;">${viewDoc.workPlan?.contractNumber || '-'}</td>
                        <td style="width: 15mm;"></td>
                        <td style="width: 35mm;">Период</td>
                        <td style="border-bottom: 1px solid black;">${formatDate(viewDoc.period)}</td>
                      </tr>
                    </table>

                    <!-- Таблица работ -->
                    <table style="margin-bottom: 5mm;">
                      <thead>
                        <tr>
                          <th rowspan="2" style="width: 8mm;">№<br>п/п</th>
                          <th rowspan="2" style="width: 80mm;">Наименование работ</th>
                          <th rowspan="2" style="width: 15mm;">Ед.<br>изм.</th>
                          <th colspan="3">Выполнено работ</th>
                        </tr>
                        <tr>
                          <th style="width: 20mm;">Коли-<br>чество</th>
                          <th style="width: 25mm;">Цена за<br>единицу, руб.</th>
                          <th style="width: 30mm;">Сумма,<br>руб.</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                        <tr>
                          <td colspan="5" align="right" class="bold">Итого:</td>
                          <td align="right" class="bold">${viewDoc.totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td colspan="5" align="right">НДС (20%):</td>
                          <td align="right">${viewDoc.vatAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td colspan="5" align="right" class="bold">Всего с НДС:</td>
                          <td align="right" class="bold">${viewDoc.totalWithVat.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Сумма прописью -->
                    <table class="no-border" style="margin-bottom: 5mm;">
                      <tr>
                        <td style="width: 30mm;">Всего на сумму:</td>
                        <td style="border-bottom: 1px solid black; font-style: italic;">
                          ${numberToWordsRu(viewDoc.totalWithVat)}
                        </td>
                      </tr>
                    </table>

                    <!-- Подписи -->
                    <table class="no-border signature-table">
                      <tr>
                        <td style="width: 40mm;">Руководитель организации</td>
                        <td style="width: 30mm;"></td>
                        <td style="border-bottom: 1px solid black; width: 45mm;"></td>
                        <td style="width: 10mm;"></td>
                        <td style="border-bottom: 1px solid black; width: 50mm;">Иванов И.И.</td>
                      </tr>
                      <tr class="small">
                        <td></td>
                        <td></td>
                        <td align="center">(должность)</td>
                        <td></td>
                        <td align="center">(подпись)</td>
                      </tr>
                      <tr>
                        <td colspan="5" style="height: 5mm;"></td>
                      </tr>
                      <tr>
                        <td>Главный бухгалтер</td>
                        <td></td>
                        <td style="border-bottom: 1px solid black;"></td>
                        <td></td>
                        <td style="border-bottom: 1px solid black;">Петрова П.П.</td>
                      </tr>
                    </table>

                    <!-- М.П. -->
                    <div style="margin-top: 10mm;">
                      <table class="no-border">
                        <tr>
                          <td style="width: 30mm;">М.П.</td>
                          <td></td>
                        </tr>
                      </table>
                    </div>
                  </body>
                  </html>
                `)
                printWindow.document.close()
                printWindow.focus()
                printWindow.print()
              }
            }}><Printer className="w-4 h-4 mr-2" />Печать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования КС-2 */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Редактирование {editDoc?.number}</DialogTitle></DialogHeader>
          {editDoc && (
            <EditKS2Form doc={editDoc} onClose={() => setEditDoc(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования КС-2
function EditKS2Form({ doc, onClose, onSuccess }: { doc: DocumentKS2; onClose: () => void; onSuccess: () => void }) {
  const { orders } = useAppStore()
  const [status, setStatus] = useState(doc.status)
  const [notes, setNotes] = useState(doc.notes || '')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Array<{name: string; unit: string; quantity: number; unitPrice: number; totalAmount: number}>>(
    doc.items?.map((item: { name: string; unit: string; quantity: number; unitPrice: number; totalAmount: number }) => ({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.totalAmount
    })) || []
  )
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')

  const addItem = () => {
    setItems([...items, { name: '', unit: 'шт', quantity: 1, unitPrice: 0, totalAmount: 0 }])
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    // Пересчитываем сумму позиции
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalAmount = newItems[index].quantity * newItems[index].unitPrice
    }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Импорт работ из наряда
  const importFromOrder = () => {
    if (!selectedOrderId) return
    const order = orders.find(o => o.id === selectedOrderId)
    if (order && order.items && order.items.length > 0) {
      const newItems = order.items.map(item => ({
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.quantity * item.unitPrice
      }))
      setItems([...items, ...newItems])
      toast.success(`Импортировано ${newItems.length} позиций из наряда ${order.number}`)
      setSelectedOrderId('')
    } else {
      toast.error('В наряде нет позиций для импорта')
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0)
  const vatAmount = totalAmount * 0.2
  const totalWithVat = totalAmount * 1.2

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/documents/ks2/${doc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status, 
        notes,
        items: items.map((item, index) => ({
          ...item,
          lineNumber: index + 1,
          totalAmount: item.quantity * item.unitPrice
        })),
        totalAmount,
        vatAmount,
        totalWithVat
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Документ обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Номер документа</Label>
          <Input value={doc.number} disabled />
        </div>
        <div>
          <Label>Статус</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Черновик</SelectItem>
              <SelectItem value="SIGNED">Подписан</SelectItem>
              <SelectItem value="APPROVED">Утвержден</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Примечания</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      {/* Позиции работ */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Позиции работ</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Добавить вручную</Button>
        </div>
        
        {/* Импорт из наряда */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <Label className="text-blue-800 mb-2 block">Импорт из наряда</Label>
          <div className="flex gap-2">
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Выберите наряд для импорта" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.number} - {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="secondary" size="sm" onClick={importFromOrder} disabled={!selectedOrderId}>
              <Briefcase className="w-4 h-4 mr-1" />Импортировать
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">Работы из наряда будут добавлены к существующим позициям</p>
        </div>
        
        {items.length === 0 && <p className="text-sm text-gray-500">Добавьте позиции вручную или импортируйте из наряда</p>}
        <div className="max-h-64 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
              <div className="col-span-5"><Input placeholder="Наименование" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} /></div>
              <div className="col-span-2"><Input placeholder="Ед." value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} /></div>
              <div className="col-span-2"><Input type="number" placeholder="Кол-во" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} /></div>
              <div className="col-span-2"><Input type="number" placeholder="Цена" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
              <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}><X className="w-4 h-4" /></Button></div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Сумма без НДС:</span><span>{formatCurrency(totalAmount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">НДС (20%):</span><span>{formatCurrency(vatAmount)}</span></div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Итого с НДС:</span><span>{formatCurrency(totalWithVat)}</span></div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== КС-3 ====================
function KS3Section() {
  const { documentsKS3, setDocumentsKS3, documentsKS2, setDocumentsKS2, workPlans, setWorkPlans } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDoc, setViewDoc] = useState<DocumentKS3 | null>(null)
  const [editDoc, setEditDoc] = useState<DocumentKS3 | null>(null)

  const fetchData = () => {
    Promise.all([
      fetch('/api/documents/ks3').then(r => r.json()),
      fetch('/api/documents/ks2').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
    ]).then(([ks3, ks2, plans]) => { setDocumentsKS3(ks3); setDocumentsKS2(ks2); setWorkPlans(plans); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить документ? Это действие нельзя отменить.')) return
    const res = await fetch(`/api/documents/ks3/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Документ удален')
      fetchData()
    } else {
      toast.error('Ошибка удаления')
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Документы КС-3</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Создать КС-3</Button>
      </div>

      <div className="grid gap-4">
        {documentsKS3.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{doc.number}</p>
                    <p className="text-gray-500">на основании {doc.documentKS2?.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(doc.totalWithVat)}</p>
                  <Badge className={statusColors.document[doc.status]}>{statusLabels.document[doc.status]}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewDoc(doc)}><Eye className="w-4 h-4 mr-1" />Просмотр</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditDoc(doc)}><Edit className="w-4 h-4 mr-1" />Изменить</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(doc.id)}><X className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {documentsKS3.length === 0 && (
          <Card><CardContent className="p-8 text-center text-gray-500">Нет документов КС-3</CardContent></Card>
        )}
      </div>

      <CreateDialog type="ks3" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} data={{ workPlans, documentsKS2 }} />

      {/* Диалог просмотра КС-3 */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Справка {viewDoc?.number}</DialogTitle></DialogHeader>
          {viewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">План работ</Label>
                  <p className="font-medium">{viewDoc.workPlan?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">На основании КС-2</Label>
                  <p className="font-medium">{viewDoc.documentKS2?.number}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Период</Label>
                  <p className="font-medium">{formatDate(viewDoc.period)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Статус</Label>
                  <p><Badge className={statusColors.document[viewDoc.status]}>{statusLabels.document[viewDoc.status]}</Badge></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Стоимость работ без НДС:</span><span>{formatCurrency(viewDoc.totalAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">НДС (20%):</span><span>{formatCurrency(viewDoc.vatAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Стоимость работ с НДС:</span><span className="font-bold">{formatCurrency(viewDoc.totalWithVat)}</span></div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between"><span className="text-gray-500">Предыдущий период (нарастающим):</span><span>{formatCurrency(viewDoc.previousTotal)}</span></div>
                    <div className="flex justify-between font-bold"><span>Текущий период:</span><span>{formatCurrency(viewDoc.currentTotal)}</span></div>
                  </div>
                </div>
              </div>

              {viewDoc.notes && (
                <div>
                  <Label className="text-gray-500">Примечания</Label>
                  <p className="text-sm mt-1">{viewDoc.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDoc(null)}>Закрыть</Button>
            <Button onClick={() => {
              const printWindow = window.open('', '_blank')
              if (printWindow && viewDoc) {
                printWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="UTF-8">
                    <title>Форма КС-3 № ${viewDoc.number}</title>
                    <style>
                      @page { size: A4; margin: 10mm; }
                      body { font-family: "Times New Roman", Times, serif; font-size: 10pt; line-height: 1.2; }
                      table { border-collapse: collapse; width: 100%; }
                      th, td { border: 1px solid black; padding: 2mm 3mm; }
                      .no-border { border: none; }
                      .no-border td, .no-border th { border: none; padding: 1mm 2mm; }
                      .header-table td { border: none; }
                      .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 5mm 0; }
                      .subtitle { text-align: center; font-size: 11pt; margin: 3mm 0; }
                      .code-row { font-size: 8pt; }
                      .code-row td { padding: 0 2mm; border: none; }
                      .small { font-size: 8pt; }
                      .right { text-align: right; }
                      .center { text-align: center; }
                      .bold { font-weight: bold; }
                      .signature-table { margin-top: 10mm; }
                      .signature-table td { border: none; padding: 3mm 5mm; }
                    </style>
                  </head>
                  <body>
                    <!-- Шапка организации -->
                    <table class="no-border header-table" style="margin-bottom: 5mm;">
                      <tr>
                        <td style="width: 50%;">
                          <div style="font-weight: bold;">ООО "СтройКомплект"</div>
                          <div class="small">ИНН 7701234567 / КПП 770101001</div>
                          <div class="small">123456, г. Москва, ул. Строителей, д. 1</div>
                        </td>
                        <td style="width: 25%;" class="small">
                          <div>Код по ОКПО</div>
                          <div style="border-bottom: 1px solid black; text-align: center;">45678901</div>
                        </td>
                        <td style="width: 25%;" class="small">
                          <div>Номер документа</div>
                          <div style="border-bottom: 1px solid black; text-align: center;">${viewDoc.number}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Коды -->
                    <table class="no-border code-row" style="margin-bottom: 3mm;">
                      <tr>
                        <td>Форма по ОКУД</td>
                        <td style="border: 1px solid black; width: 25mm; text-align: center;">0322006</td>
                        <td style="width: 20mm;"></td>
                        <td>Дата составления</td>
                        <td style="border: 1px solid black; width: 35mm; text-align: center;">${formatDate(viewDoc.createdAt)}</td>
                      </tr>
                    </table>

                    <!-- Заказчик -->
                    <table class="no-border" style="margin-bottom: 3mm; font-size: 9pt;">
                      <tr>
                        <td style="width: 25mm;">Заказчик</td>
                        <td style="border-bottom: 1px solid black;">ООО "Заказчик-Инвестор"</td>
                        <td style="width: 5mm;"></td>
                        <td class="small" style="width: 20mm;">по ОКПО</td>
                        <td style="border-bottom: 1px solid black; width: 40mm;"></td>
                      </tr>
                    </table>

                    <!-- Название объекта -->
                    <table class="no-border" style="margin-bottom: 5mm; font-size: 9pt;">
                      <tr>
                        <td style="width: 60mm;">Наименование объекта</td>
                        <td style="border-bottom: 1px solid black;">${viewDoc.workPlan?.name || '-'}</td>
                      </tr>
                    </table>

                    <!-- Заголовок -->
                    <div class="title">СПРАВКА<br>о стоимости выполненных работ и затрат</div>
                    <div class="subtitle">Форма № КС-3</div>

                    <!-- Информация о договоре -->
                    <table class="no-border" style="margin-bottom: 5mm; font-size: 9pt;">
                      <tr>
                        <td style="width: 50mm;">Номер договора</td>
                        <td style="border-bottom: 1px solid black; width: 45mm;">${viewDoc.workPlan?.contractNumber || '-'}</td>
                        <td style="width: 15mm;"></td>
                        <td style="width: 35mm;">Период</td>
                        <td style="border-bottom: 1px solid black;">${formatDate(viewDoc.period)}</td>
                      </tr>
                    </table>

                    <!-- Таблица стоимости -->
                    <table style="margin-bottom: 5mm;">
                      <thead>
                        <tr>
                          <th style="width: 8mm;">№<br>п/п</th>
                          <th>Наименование</th>
                          <th style="width: 35mm;">Код</th>
                          <th style="width: 30mm;">Стоимость работ, руб.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td align="center">1</td>
                          <td>Стоимость выполненных работ (без НДС)</td>
                          <td align="center"></td>
                          <td align="right">${viewDoc.totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td align="center">2</td>
                          <td>НДС (20%)</td>
                          <td align="center"></td>
                          <td align="right">${viewDoc.vatAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td align="center">3</td>
                          <td class="bold">Всего с НДС</td>
                          <td align="center"></td>
                          <td align="right" class="bold">${viewDoc.totalWithVat.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td align="center">4</td>
                          <td>Стоимость работ с начала строительства (нарастающим итогом)</td>
                          <td align="center"></td>
                          <td align="right">${viewDoc.currentTotal.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td align="center">5</td>
                          <td>в том числе за предыдущий период</td>
                          <td align="center"></td>
                          <td align="right">${viewDoc.previousTotal.toLocaleString('ru-RU', {minimumFractionDigits: 2})}</td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Сумма прописью -->
                    <table class="no-border" style="margin-bottom: 5mm;">
                      <tr>
                        <td style="width: 30mm;">Всего на сумму:</td>
                        <td style="border-bottom: 1px solid black; font-style: italic;">
                          ${numberToWordsRu(viewDoc.totalWithVat)}
                        </td>
                      </tr>
                    </table>

                    <!-- Подписи -->
                    <table class="no-border signature-table">
                      <tr>
                        <td style="width: 40mm;">Руководитель организации</td>
                        <td style="width: 30mm;"></td>
                        <td style="border-bottom: 1px solid black; width: 45mm;"></td>
                        <td style="width: 10mm;"></td>
                        <td style="border-bottom: 1px solid black; width: 50mm;">Иванов И.И.</td>
                      </tr>
                      <tr class="small">
                        <td></td>
                        <td></td>
                        <td align="center">(должность)</td>
                        <td></td>
                        <td align="center">(подпись)</td>
                      </tr>
                      <tr>
                        <td colspan="5" style="height: 5mm;"></td>
                      </tr>
                      <tr>
                        <td>Главный бухгалтер</td>
                        <td></td>
                        <td style="border-bottom: 1px solid black;"></td>
                        <td></td>
                        <td style="border-bottom: 1px solid black;">Петрова П.П.</td>
                      </tr>
                    </table>

                    <!-- М.П. -->
                    <div style="margin-top: 10mm;">
                      <table class="no-border">
                        <tr>
                          <td style="width: 30mm;">М.П.</td>
                          <td></td>
                        </tr>
                      </table>
                    </div>

                    ${viewDoc.notes ? `<div style="margin-top: 10mm;"><strong>Примечания:</strong> ${viewDoc.notes}</div>` : ''}
                  </body>
                  </html>
                `)
                printWindow.document.close()
                printWindow.focus()
                printWindow.print()
              }
            }}><Printer className="w-4 h-4 mr-2" />Печать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования КС-3 */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Редактирование {editDoc?.number}</DialogTitle></DialogHeader>
          {editDoc && (
            <EditKS3Form doc={editDoc} onClose={() => setEditDoc(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования КС-3
function EditKS3Form({ doc, onClose, onSuccess }: { doc: DocumentKS3; onClose: () => void; onSuccess: () => void }) {
  const { documentsKS2 } = useAppStore()
  const [status, setStatus] = useState(doc.status)
  const [notes, setNotes] = useState(doc.notes || '')
  const [ks2Id, setKs2Id] = useState(doc.ks2Id)
  const [previousTotal, setPreviousTotal] = useState(doc.previousTotal || 0)
  const [loading, setLoading] = useState(false)

  // Находим выбранный КС-2
  const selectedKS2 = documentsKS2.find((ks2) => ks2.id === ks2Id)

  // Считаем суммы на основе выбранного КС-2
  const totalAmount = selectedKS2?.totalAmount || 0
  const vatAmount = selectedKS2?.vatAmount || 0
  const totalWithVat = selectedKS2?.totalWithVat || 0
  const currentTotal = totalWithVat + previousTotal

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/documents/ks3/${doc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status, 
        notes,
        ks2Id,
        totalAmount,
        vatAmount,
        totalWithVat,
        previousTotal,
        currentTotal
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Документ обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Номер документа</Label>
          <Input value={doc.number} disabled />
        </div>
        <div>
          <Label>Статус</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Черновик</SelectItem>
              <SelectItem value="SIGNED">Подписан</SelectItem>
              <SelectItem value="APPROVED">Утвержден</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Документ КС-2 (основание)</Label>
        <Select value={ks2Id} onValueChange={setKs2Id}>
          <SelectTrigger><SelectValue placeholder="Выберите КС-2" /></SelectTrigger>
          <SelectContent>
            {documentsKS2.map((ks2) => (
              <SelectItem key={ks2.id} value={ks2.id}>{ks2.number} - {formatCurrency(ks2.totalWithVat)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Позиции работ из КС-2 */}
      {selectedKS2 && selectedKS2.items && selectedKS2.items.length > 0 && (
        <div className="border-t pt-4">
          <Label className="text-gray-500 mb-2 block">Позиции работ из КС-2 (только чтение)</Label>
          <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 text-sm font-medium text-gray-500">№</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-500">Наименование</th>
                  <th className="text-right p-2 text-sm font-medium text-gray-500">Кол-во</th>
                  <th className="text-right p-2 text-sm font-medium text-gray-500">Цена</th>
                  <th className="text-right p-2 text-sm font-medium text-gray-500">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedKS2.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 text-sm">{idx + 1}</td>
                    <td className="p-2 text-sm">{item.name}</td>
                    <td className="p-2 text-sm text-right">{item.quantity} {item.unit}</td>
                    <td className="p-2 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-sm text-right font-medium">{formatCurrency(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Нарастающий итог предыдущих периодов</Label>
          <Input 
            type="number" 
            value={previousTotal} 
            onChange={(e) => setPreviousTotal(parseFloat(e.target.value) || 0)} 
          />
        </div>
        <div>
          <Label>Текущий период (нарастающим)</Label>
          <Input value={formatCurrency(currentTotal)} disabled className="bg-gray-50" />
        </div>
      </div>

      <div>
        <Label>Примечания</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Сумма без НДС:</span><span>{formatCurrency(totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">НДС (20%):</span><span>{formatCurrency(vatAmount)}</span></div>
          <div className="flex justify-between font-bold"><span>Итого с НДС:</span><span>{formatCurrency(totalWithVat)}</span></div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== АКТЫ СКРЫТЫХ РАБОТ ====================
function HiddenActsSection() {
  const { hiddenWorkActs, setHiddenWorkActs, workPlans, setWorkPlans } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewAct, setViewAct] = useState<HiddenWorkAct | null>(null)
  const [editAct, setEditAct] = useState<HiddenWorkAct | null>(null)

  const fetchData = () => {
    Promise.all([
      fetch('/api/documents/hidden-acts').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
    ]).then(([acts, plans]) => { setHiddenWorkActs(acts); setWorkPlans(plans); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить акт?')) return
    const res = await fetch(`/api/documents/hidden-acts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Акт удален')
      fetchData()
    } else {
      toast.error('Ошибка удаления')
    }
  }

  const handlePrint = (act: HiddenWorkAct) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Акт скрытых работ № ${act.number}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.4; }
            .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 10mm 0; }
            .subtitle { text-align: center; font-size: 11pt; margin: 5mm 0; }
            table { border-collapse: collapse; width: 100%; margin: 5mm 0; }
            th, td { border: 1px solid black; padding: 2mm 3mm; text-align: left; }
            .no-border { border: none; }
            .no-border td { border: none; padding: 1mm 2mm; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="title">АКТ<br>ОСМОТРА СКРЫТЫХ РАБОТ</div>
          <div class="subtitle">Акт № ${act.number}</div>
          
          <table class="no-border">
            <tr><td style="width: 50mm;">Наименование работ</td><td class="bold">${act.name}</td></tr>
            <tr><td>Место проведения</td><td>${act.location || '-'}</td></tr>
            <tr><td>Дата выполнения</td><td>${formatDate(act.executedAt)}</td></tr>
          </table>
          
          <p><b>Описание работ:</b></p>
          <p>${act.description}</p>
          
          <table style="margin-top: 10mm;">
            <tr>
              <th>Должность</th>
              <th>ФИО</th>
              <th>Подпись</th>
            </tr>
            <tr>
              <td>Представитель подрядчика<br>${act.contractorPosition || ''}</td>
              <td>${act.contractorName || ''}</td>
              <td></td>
            </tr>
            <tr>
              <td>Представитель заказчика<br>${act.customerPosition || ''}</td>
              <td>${act.customerName || ''}</td>
              <td></td>
            </tr>
          </table>
          
          <p style="margin-top: 10mm;">Дата составления акта: ${act.signedAt ? formatDate(act.signedAt) : formatDate(new Date())}</p>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Акты скрытых работ</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Создать акт</Button>
      </div>

      <div className="grid gap-4">
        {hiddenWorkActs.map((act) => (
          <Card key={act.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold">{act.number}</p>
                    <p className="font-medium">{act.name}</p>
                    <p className="text-sm text-gray-500">{act.description}</p>
                    <p className="text-sm text-gray-400 mt-1">Выполнено: {formatDate(act.executedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColors.hiddenAct[act.status]}>{statusLabels.hiddenAct[act.status]}</Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setViewAct(act)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setEditAct(act)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(act)}><Printer className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(act.id)}><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {hiddenWorkActs.length === 0 && (
          <Card><CardContent className="p-8 text-center text-gray-500">Нет актов скрытых работ</CardContent></Card>
        )}
      </div>

      <CreateDialog type="hiddenAct" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} data={{ workPlans }} />

      {/* Диалог просмотра акта */}
      <Dialog open={!!viewAct} onOpenChange={() => setViewAct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Акт скрытых работ № {viewAct?.number}</DialogTitle></DialogHeader>
          {viewAct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-500">Наименование</Label><p className="font-medium">{viewAct.name}</p></div>
                <div><Label className="text-gray-500">Место проведения</Label><p className="font-medium">{viewAct.location || '-'}</p></div>
                <div><Label className="text-gray-500">Дата выполнения</Label><p className="font-medium">{formatDate(viewAct.executedAt)}</p></div>
                <div><Label className="text-gray-500">Статус</Label><p><Badge className={statusColors.hiddenAct[viewAct.status]}>{statusLabels.hiddenAct[viewAct.status]}</Badge></p></div>
              </div>
              <div><Label className="text-gray-500">Описание работ</Label><p className="mt-1">{viewAct.description}</p></div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div><Label className="text-gray-500">Представитель подрядчика</Label><p>{viewAct.contractorName} ({viewAct.contractorPosition})</p></div>
                <div><Label className="text-gray-500">Представитель заказчика</Label><p>{viewAct.customerName} ({viewAct.customerPosition})</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAct(null)}>Закрыть</Button>
            <Button onClick={() => { setEditAct(viewAct); setViewAct(null) }}>Редактировать</Button>
            <Button onClick={() => { if (viewAct) handlePrint(viewAct) }}><Printer className="w-4 h-4 mr-2" />Печать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования акта */}
      <Dialog open={!!editAct} onOpenChange={() => setEditAct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Редактирование акта</DialogTitle></DialogHeader>
          {editAct && (
            <EditHiddenActForm act={editAct} onClose={() => setEditAct(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования акта скрытых работ
function EditHiddenActForm({ act, onClose, onSuccess }: { act: HiddenWorkAct; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(act.name)
  const [description, setDescription] = useState(act.description)
  const [location, setLocation] = useState(act.location || '')
  const [status, setStatus] = useState(act.status)
  const [contractorName, setContractorName] = useState(act.contractorName || '')
  const [contractorPosition, setContractorPosition] = useState(act.contractorPosition || '')
  const [customerName, setCustomerName] = useState(act.customerName || '')
  const [customerPosition, setCustomerPosition] = useState(act.customerPosition || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/documents/hidden-acts/${act.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, location, status, contractorName, contractorPosition, customerName, customerPosition }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Акт обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div><Label>Наименование работ</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><Label>Описание</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
      <div><Label>Место проведения</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
      <div><Label>Статус</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Черновик</SelectItem>
            <SelectItem value="SIGNED">Подписан</SelectItem>
            <SelectItem value="APPROVED">Утвержден</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div><Label>Представитель подрядчика (ФИО)</Label><Input value={contractorName} onChange={(e) => setContractorName(e.target.value)} /></div>
        <div><Label>Должность</Label><Input value={contractorPosition} onChange={(e) => setContractorPosition(e.target.value)} /></div>
        <div><Label>Представитель заказчика (ФИО)</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
        <div><Label>Должность</Label><Input value={customerPosition} onChange={(e) => setCustomerPosition(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== ПЕРСОНАЛ ====================
function EmployeesSection() {
  const { employees, setEmployees } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)

  const fetchData = () => {
    fetch('/api/employees').then(res => res.json()).then(data => { setEmployees(data); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сотрудника?')) return
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Сотрудник удален')
      fetchData()
    } else {
      toast.error('Ошибка удаления')
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Персонал</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card key={emp.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">{emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{emp.fullName}</p>
                  <p className="text-sm text-gray-500">{emp.position}</p>
                </div>
                <Badge className={statusColors.employee[emp.status]}>{statusLabels.employee[emp.status]}</Badge>
              </div>
              <div className="mt-4 pt-4 border-t text-sm space-y-1">
                {emp.phone && <div className="flex justify-between"><span className="text-gray-500">Телефон:</span><span>{emp.phone}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Ставка:</span><span>{formatCurrency(emp.monthlySalary)}/мес</span></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewEmployee(emp)}><Eye className="w-4 h-4 mr-1" />Профиль</Button>
                <Button variant="outline" size="sm" onClick={() => setEditEmployee(emp)}><Edit className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(emp.id)}><X className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateDialog type="employee" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} />

      {/* Диалог просмотра профиля */}
      <Dialog open={!!viewEmployee} onOpenChange={() => setViewEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Профиль сотрудника</DialogTitle></DialogHeader>
          {viewEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-xl">{viewEmployee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div>
                  <p className="font-bold text-lg">{viewEmployee.fullName}</p>
                  <p className="text-gray-500">{viewEmployee.position}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {viewEmployee.phone && <div className="flex justify-between"><span className="text-gray-500">Телефон:</span><span>{viewEmployee.phone}</span></div>}
                {viewEmployee.email && <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{viewEmployee.email}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Специальность:</span><span>{viewEmployee.specialty || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ставка:</span><span>{formatCurrency(viewEmployee.monthlySalary)}/мес</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Почасовая:</span><span>{formatCurrency(viewEmployee.hourlyRate)}/час</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Статус:</span><Badge className={statusColors.employee[viewEmployee.status]}>{statusLabels.employee[viewEmployee.status]}</Badge></div>
                {viewEmployee.hireDate && <div className="flex justify-between"><span className="text-gray-500">Дата найма:</span><span>{formatDate(viewEmployee.hireDate)}</span></div>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEmployee(null)}>Закрыть</Button>
            <Button onClick={() => { setEditEmployee(viewEmployee); setViewEmployee(null) }}>Редактировать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={!!editEmployee} onOpenChange={() => setEditEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Редактирование сотрудника</DialogTitle></DialogHeader>
          {editEmployee && (
            <EditEmployeeForm employee={editEmployee} onClose={() => setEditEmployee(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования сотрудника
function EditEmployeeForm({ employee, onClose, onSuccess }: { employee: Employee; onClose: () => void; onSuccess: () => void }) {
  const [fullName, setFullName] = useState(employee.fullName)
  const [phone, setPhone] = useState(employee.phone || '')
  const [position, setPosition] = useState(employee.position || '')
  const [monthlySalary, setMonthlySalary] = useState(employee.monthlySalary)
  const [status, setStatus] = useState(employee.status)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/employees/${employee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, position, monthlySalary: Number(monthlySalary), status }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Сотрудник обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div><Label>ФИО</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
      <div><Label>Телефон</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div><Label>Должность</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} /></div>
      <div><Label>Ставка/мес</Label><Input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} /></div>
      <div><Label>Статус</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Работает</SelectItem>
            <SelectItem value="VACATION">В отпуске</SelectItem>
            <SelectItem value="SICK">На больничном</SelectItem>
            <SelectItem value="FIRED">Уволен</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== ЗАРПЛАТА ====================
function SalarySection() {
  const { salaryPayments, setSalaryPayments, employees, setEmployees } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = () => {
    Promise.all([
      fetch('/api/salary').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ]).then(([salaries, emps]) => { setSalaryPayments(salaries); setEmployees(emps); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div className="p-6">Загрузка...</div>

  const totalPending = salaryPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.total, 0)

  const handlePay = async (id: string) => {
    const res = await fetch('/api/salary', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'PAID' }),
    })
    if (res.ok) {
      toast.success('Выплата произведена')
      setSalaryPayments(salaryPayments.map(p => p.id === id ? { ...p, status: 'PAID' } : p))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Зарплата</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Начислить</Button>
      </div>

      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium">К выплате</p>
              <p className="text-3xl font-bold">{formatCurrency(totalPending)}</p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Выплатить все</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-500">Сотрудник</th>
                  <th className="text-left p-4 font-medium text-gray-500">Период</th>
                  <th className="text-right p-4 font-medium text-gray-500">К выплате</th>
                  <th className="text-center p-4 font-medium text-gray-500">Статус</th>
                  <th className="text-center p-4 font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {salaryPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4">{p.employee?.fullName}</td>
                    <td className="p-4">{formatDate(p.period)}</td>
                    <td className="p-4 text-right font-bold">{formatCurrency(p.total)}</td>
                    <td className="p-4 text-center">
                      <Badge className={statusColors.salary[p.status]}>{statusLabels.salary[p.status]}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      {p.status === 'PENDING' && (
                        <Button variant="outline" size="sm" onClick={() => handlePay(p.id)}>Выплатить</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CreateDialog type="salary" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} data={{ employees }} />
    </div>
  )
}

// ==================== НАРЯДЫ ====================
function OrdersSection() {
  const { orders, setOrders, employees, setEmployees, workPlans, setWorkPlans } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<typeof orders[0] | null>(null)
  const [viewOrder, setViewOrder] = useState<typeof orders[0] | null>(null)
  const [timers, setTimers] = useState<Record<string, number>>({})

  const fetchData = () => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
      fetch('/api/plans').then(r => r.json()),
    ]).then(([ords, emps, plans]) => { setOrders(Array.isArray(ords) ? ords : []); setEmployees(Array.isArray(emps) ? emps : []); setWorkPlans(Array.isArray(plans) ? plans : []); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  // Обновление таймеров каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {}
      orders.forEach(order => {
        if (order.status === 'IN_PROGRESS' && order.startedAt) {
          const elapsed = (order.totalTimeMinutes || 0) * 60 + Math.floor((Date.now() - new Date(order.startedAt).getTime()) / 1000)
          newTimers[order.id] = elapsed
        } else if (order.totalTimeMinutes) {
          newTimers[order.id] = order.totalTimeMinutes * 60
        }
      })
      setTimers(newTimers)
    }, 1000)
    return () => clearInterval(interval)
  }, [orders])

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success('Статус обновлен')
      fetchData()
    } else {
      toast.error('Ошибка обновления статуса')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить наряд?')) return
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Наряд удален')
      fetchData()
    } else {
      toast.error('Ошибка удаления')
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  const priorityColors: Record<number, string> = { 1: 'bg-gray-100 text-gray-600', 2: 'bg-yellow-100 text-yellow-600', 3: 'bg-red-100 text-red-600' }
  const priorityLabels: Record<number, string> = { 1: 'Низкий', 2: 'Средний', 3: 'Высокий' }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Наряды на монтаж</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Создать наряд</Button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{order.number}</p>
                      <Badge className={priorityColors[order.priority]}>{priorityLabels[order.priority]}</Badge>
                      <Badge className={statusColors.order[order.status]}>{statusLabels.order[order.status]}</Badge>
                    </div>
                    <p className="font-medium mt-1">{order.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {order.location && <span>📍 {order.location}</span>}
                      {order.deadline && <span>📅 Срок: {formatDate(order.deadline)}</span>}
                    </div>
                    {/* Исполнители */}
                    {order.assignees && order.assignees.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">Исполнители:</span>
                        <div className="flex -space-x-2">
                          {order.assignees.map((a) => (
                            <div key={a.id} className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 border-2 border-white" title={a.employee?.fullName}>
                              {a.employee?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Счётчик времени */}
                    {(order.status === 'IN_PROGRESS' || order.status === 'PAUSED' || order.status === 'COMPLETED') && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">⏱ Время:</span>
                        <span className={`font-mono text-sm font-medium ${order.status === 'IN_PROGRESS' ? 'text-green-600' : order.status === 'PAUSED' ? 'text-orange-600' : 'text-gray-600'}`}>
                          {formatTime(timers[order.id] || 0)}
                        </span>
                        {order.status === 'IN_PROGRESS' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Кнопки управления */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Кнопки смены статуса */}
                  <div className="flex items-center gap-1">
                    {order.status !== 'IN_PROGRESS' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')}
                      >
                        ▶ В работу
                      </Button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => handleStatusChange(order.id, 'PAUSED')}
                      >
                        ⏸ Пауза
                      </Button>
                    )}
                    {order.status === 'PAUSED' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')}
                      >
                        ▶ Продолжить
                      </Button>
                    )}
                    {(order.status === 'IN_PROGRESS' || order.status === 'PAUSED') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                      >
                        ✓ Завершить
                      </Button>
                    )}
                  </div>
                  {/* Кнопки действий */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewOrder(order)} title="Просмотр"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditOrder(order)} title="Редактировать"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(order.id)} title="Удалить"><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card><CardContent className="p-8 text-center text-gray-500">Нет нарядов</CardContent></Card>
        )}
      </div>

      <CreateDialog type="order" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} data={{ workPlans, employees }} />

      {/* Диалог просмотра наряда */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Наряд {viewOrder?.number}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Статус</Label>
                  <p><Badge className={statusColors.order[viewOrder.status]}>{statusLabels.order[viewOrder.status]}</Badge></p>
                </div>
                <div>
                  <Label className="text-gray-500">Приоритет</Label>
                  <p>{viewOrder.priority === 1 ? 'Низкий' : viewOrder.priority === 2 ? 'Средний' : 'Высокий'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Наименование работ</Label>
                  <p className="font-medium">{viewOrder.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Место проведения</Label>
                  <p>{viewOrder.location || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Срок выполнения</Label>
                  <p>{formatDate(viewOrder.deadline)}</p>
                </div>
              </div>

              {viewOrder.description && (
                <div>
                  <Label className="text-gray-500">Описание</Label>
                  <p className="text-sm mt-1">{viewOrder.description}</p>
                </div>
              )}

              {/* Исполнители */}
              {viewOrder.assignees && viewOrder.assignees.length > 0 && (
                <div>
                  <Label className="text-gray-500">Исполнители</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewOrder.assignees.map((a) => (
                      <Badge key={a.id} variant="outline">{a.employee?.fullName}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Состав работ */}
              {viewOrder.items && viewOrder.items.length > 0 ? (
                <div>
                  <Label className="text-gray-500 mb-2 block">Состав работ</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-500">Наименование</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-500">Ед.</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-500">Кол-во</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-500">Цена</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-500">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {viewOrder.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3 text-sm">{item.name}</td>
                            <td className="p-3 text-sm text-center">{item.unit}</td>
                            <td className="p-3 text-sm text-right">{item.quantity}</td>
                            <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="p-3 text-sm font-medium text-right">Итого:</td>
                          <td className="p-3 text-sm font-bold text-right">
                            {formatCurrency(viewOrder.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Состав работ не указан</div>
              )}

              {viewOrder.notes && (
                <div>
                  <Label className="text-gray-500">Примечания</Label>
                  <p className="text-sm mt-1">{viewOrder.notes}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOrder(null)}>Закрыть</Button>
                <Button onClick={() => { const o = viewOrder; setViewOrder(null); setEditOrder(o); }}>Редактировать</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования наряда */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Редактирование {editOrder?.number}</DialogTitle></DialogHeader>
          {editOrder && (
            <EditOrderForm order={editOrder} onClose={() => setEditOrder(null)} onSuccess={fetchData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Форма редактирования наряда
function EditOrderForm({ order, onClose, onSuccess }: { order: InstallationOrder; onClose: () => void; onSuccess: () => void }) {
  const { workPlans, employees } = useAppStore()
  const [name, setName] = useState(order.name)
  const [description, setDescription] = useState(order.description || '')
  const [location, setLocation] = useState(order.location || '')
  const [priority, setPriority] = useState(order.priority)
  const [deadline, setDeadline] = useState(order.deadline ? new Date(order.deadline).toISOString().split('T')[0] : '')
  const [notes, setNotes] = useState(order.notes || '')
  const [items, setItems] = useState<Array<{id?: string; name: string; unit: string; quantity: number; unitPrice: number}>>(order.items || [])
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { name: '', unit: 'шт', quantity: 1, unitPrice: 0 }])
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        location,
        priority,
        deadline: deadline || null,
        notes,
        items: items.filter(i => i.name),
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Наряд обновлен')
      onSuccess()
      onClose()
    } else {
      toast.error('Ошибка обновления')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Номер наряда</Label>
          <Input value={order.number} disabled />
        </div>
        <div>
          <Label>Приоритет</Label>
          <Select value={String(priority)} onValueChange={(v) => setPriority(parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Низкий</SelectItem>
              <SelectItem value="2">Средний</SelectItem>
              <SelectItem value="3">Высокий</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Наименование работ</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Описание</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Место проведения</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <Label>Срок выполнения</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Примечания</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      
      {/* Исполнители (только чтение) */}
      {order.assignees && order.assignees.length > 0 && (
        <div>
          <Label className="text-gray-500">Исполнители</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {order.assignees.map((a) => (
              <Badge key={a.id} variant="outline">{a.employee?.fullName}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Состав работ */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Состав работ</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Добавить</Button>
        </div>
        {items.length === 0 && <p className="text-sm text-gray-500">Нажмите "Добавить" для добавления позиций</p>}
        {items.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 text-sm font-medium text-gray-500">Наименование</th>
                  <th className="text-center p-2 text-sm font-medium text-gray-500 w-16">Ед.</th>
                  <th className="text-right p-2 text-sm font-medium text-gray-500 w-20">Кол-во</th>
                  <th className="text-right p-2 text-sm font-medium text-gray-500 w-24">Цена</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <Input 
                        placeholder="Наименование" 
                        value={item.name} 
                        onChange={(e) => updateItem(idx, 'name', e.target.value)} 
                        className="border-0 h-8 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <Input 
                        placeholder="Ед." 
                        value={item.unit} 
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)} 
                        className="border-0 h-8 text-sm text-center"
                      />
                    </td>
                    <td className="p-2">
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} 
                        className="border-0 h-8 text-sm text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} 
                        className="border-0 h-8 text-sm text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeItem(idx)}>
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {items.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg flex justify-between text-sm">
            <span className="text-gray-500">Итого:</span>
            <span className="font-bold">{formatCurrency(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}</span>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
      </DialogFooter>
    </div>
  )
}

// ==================== ТЕХНИКА БЕЗОПАСНОСТИ ====================
function SafetySection() {
  const { briefings, setBriefings, safetyRecords, setSafetyRecords, employees, setEmployees } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('briefings')
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = () => {
    Promise.all([
      fetch('/api/safety/briefings').then(r => r.json()),
      fetch('/api/safety/records').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ]).then(([briefs, records, emps]) => { 
      setBriefings(Array.isArray(briefs) ? briefs : []); 
      setSafetyRecords(Array.isArray(records) ? records : []); 
      setEmployees(Array.isArray(emps) ? emps : []); 
      setLoading(false) 
    }).catch(() => {
      setBriefings([])
      setSafetyRecords([])
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Техника безопасности</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Провести инструктаж</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="briefings">Инструктажи</TabsTrigger>
          <TabsTrigger value="journal">Журнал</TabsTrigger>
        </TabsList>

        <TabsContent value="briefings" className="space-y-4 mt-4">
          {briefings.length === 0 && (
            <Card><CardContent className="p-8 text-center text-gray-500">Нет инструктажей</CardContent></Card>
          )}
          {briefings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-sm text-gray-500">{b.description}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Прошли: {b._count?.records || 0}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-500">Сотрудник</th>
                      <th className="text-left p-4 font-medium text-gray-500">Инструктаж</th>
                      <th className="text-left p-4 font-medium text-gray-500">Дата</th>
                      <th className="text-left p-4 font-medium text-gray-500">Результат</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {safetyRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-4">{r.employee?.fullName}</td>
                        <td className="p-4">{r.briefing?.name}</td>
                        <td className="p-4">{formatDate(r.date)}</td>
                        <td className="p-4">
                          <Badge className={r.result === 'прошел' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {r.result}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateDialog type="safety" open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchData} data={{ briefings, employees }} />
    </div>
  )
}

// ==================== НАСТРОЙКИ ====================
function SettingsSection() {
  const user = useAppStore((s) => s.user)
  const [backingUp, setBackingUp] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dbStats, setDbStats] = useState<{ counts: Record<string, number>; total: number } | null>(null)

  useEffect(() => {
    fetch('/api/settings/database').then(r => r.json()).then(setDbStats).catch(console.error)
  }, [])

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      const res = await fetch('/api/settings/backup')
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stroycomplex-backup-${new Date().toISOString().split('T')[0]}.db`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Бэкап создан')
      } else {
        toast.error('Ошибка создания бэкапа')
      }
    } catch (error) {
      toast.error('Ошибка создания бэкапа')
    }
    setBackingUp(false)
  }

  const handleReload = async () => {
    if (!confirm('Перезагрузить приложение? Все несохранённые данные будут потеряны.')) return
    setReloading(true)
    try {
      await fetch('/api/settings/reload', { method: 'POST' })
      toast.success('Приложение перезагружается...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error('Ошибка перезагрузки')
      setReloading(false)
    }
  }

  const handleClearDb = async () => {
    if (!confirm('Очистить базу данных? Все данные будут удалены!')) return
    if (!confirm('Вы уверены? Это действие нельзя отменить!')) return
    setLoading(true)
    try {
      const res = await fetch('/api/settings/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      })
      if (res.ok) {
        toast.success('База данных очищена')
        const stats = await fetch('/api/settings/database').then(r => r.json())
        setDbStats(stats)
      } else {
        toast.error('Ошибка очистки')
      }
    } catch (error) {
      toast.error('Ошибка очистки')
    }
    setLoading(false)
  }

  const handleLoadDemo = async () => {
    if (!confirm('Загрузить демо-данные? Текущие данные будут заменены!')) return
    setLoading(true)
    try {
      const res = await fetch('/api/settings/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo' })
      })
      if (res.ok) {
        toast.success('Демо-данные загружены')
        const stats = await fetch('/api/settings/database').then(r => r.json())
        setDbStats(stats)
      } else {
        toast.error('Ошибка загрузки демо-данных')
      }
    } catch (error) {
      toast.error('Ошибка загрузки демо-данных')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Настройки</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Профиль пользователя</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold text-xl">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div>
                <p className="font-medium text-lg">{user?.name}</p>
                <p className="text-gray-500">{user?.email}</p>
                <Badge className="mt-1">{user?.role}</Badge>
              </div>
            </div>
            <div className="grid gap-4">
              <div><Label>Имя</Label><Input defaultValue={user?.name} /></div>
              <div><Label>Email</Label><Input defaultValue={user?.email} /></div>
            </div>
            <Button className="w-full">Сохранить</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>База данных</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Тип БД</p><p className="text-sm text-gray-500">SQLite</p></div>
              <Badge className="bg-green-100 text-green-800">Подключена</Badge>
            </div>
            
            {dbStats && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium mb-2">Статистика данных</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold">{dbStats.counts.directions}</p>
                    <p className="text-gray-500">Направлений</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold">{dbStats.counts.buildings}</p>
                    <p className="text-gray-500">Объектов</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold">{dbStats.counts.plans}</p>
                    <p className="text-gray-500">Планов</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold">{dbStats.counts.employees}</p>
                    <p className="text-gray-500">Сотрудников</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold">{dbStats.counts.orders}</p>
                    <p className="text-gray-500">Нарядов</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold">{dbStats.total}</p>
                    <p className="text-gray-500">Всего</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleLoadDemo} disabled={loading}>
                  <Database className="w-4 h-4 mr-2" />
                  Загрузить демо
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleClearDb} disabled={loading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Очистить базу
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={handleBackup} disabled={backingUp}>
                <Download className="w-4 h-4 mr-2" />
                {backingUp ? 'Создание бэкапа...' : 'Скачать бэкап базы'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Система</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Версия</p><p className="text-sm text-gray-500">1.0.0</p></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div><p className="font-medium">PWA</p><p className="text-sm text-gray-500">Мобильное приложение</p></div>
              <Badge className="bg-blue-100 text-blue-800">Активно</Badge>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full text-orange-600 hover:text-orange-700" onClick={handleReload} disabled={reloading}>
                <Settings className="w-4 h-4 mr-2" />
                {reloading ? 'Перезагрузка...' : 'Перезагрузить приложение'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== ГЛАВНЫЙ КОМПОНЕНТ ====================
export default function Home() {
  const { user, setUser, currentSection, setDashboard, setOrders, setSalaryPayments } = useAppStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)) } catch { localStorage.removeItem('user') }
    }
    requestAnimationFrame(() => setChecking(false))
  }, [setUser])

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch('/api/dashboard').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/salary').then(r => r.json()),
      ]).then(([dash, ords, sal]) => { setDashboard(dash); setOrders(ords); setSalaryPayments(sal) }).catch(console.error)
    }
  }, [user, setDashboard, setOrders, setSalaryPayments])

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (!user) return <LoginForm />

  const sections: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    directions: <DirectionsSection />,
    buildings: <BuildingsSection />,
    plans: <PlansSection />,
    ks2: <KS2Section />,
    ks3: <KS3Section />,
    'hidden-acts': <HiddenActsSection />,
    employees: <EmployeesSection />,
    salary: <SalarySection />,
    orders: <OrdersSection />,
    safety: <SafetySection />,
    settings: <SettingsSection />,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{sections[currentSection] || <DashboardSection />}</main>
    </div>
  )
}
