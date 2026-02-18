'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { WorkDirection, Building, WorkPlan, Employee } from '@/lib/store'

// Диалог создания направления работ
interface DirectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  direction?: WorkDirection | null
  onSuccess: () => void
}

export function DirectionDialog({ open, onOpenChange, direction, onSuccess }: DirectionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: direction?.name || '',
    code: direction?.code || '',
    description: direction?.description || '',
    color: direction?.color || '#3B82F6',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = direction ? `/api/directions/${direction.id}` : '/api/directions'
      const method = direction ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      
      if (res.ok) {
        toast.success(direction ? 'Направление обновлено' : 'Направление создано')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error('Ошибка сохранения')
      }
    } catch {
      toast.error('Ошибка соединения')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{direction ? 'Редактировать направление' : 'Новое направление работ'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Монтаж сетей связи"
              required
            />
          </div>
          <div>
            <Label>Код</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="СС"
              required
            />
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание направления работ..."
            />
          </div>
          <div>
            <Label>Цвет</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Диалог создания объекта
interface BuildingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  building?: Building | null
  onSuccess: () => void
}

export function BuildingDialog({ open, onOpenChange, building, onSuccess }: BuildingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: building?.name || '',
    address: building?.address || '',
    floors: building?.floors || 1,
    totalArea: building?.totalArea || '',
    status: building?.status || 'ACTIVE',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = building ? `/api/buildings/${building.id}` : '/api/buildings'
      const method = building ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          totalArea: form.totalArea ? parseFloat(form.totalArea as string) : null,
        }),
      })
      
      if (res.ok) {
        toast.success(building ? 'Объект обновлен' : 'Объект создан')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error('Ошибка сохранения')
      }
    } catch {
      toast.error('Ошибка соединения')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{building ? 'Редактировать объект' : 'Новый объект строительства'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Корпус 1"
              required
            />
          </div>
          <div>
            <Label>Адрес</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="г. Москва, ул. Строителей, д. 15"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Этажей</Label>
              <Input
                type="number"
                value={form.floors}
                onChange={(e) => setForm({ ...form, floors: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
            <div>
              <Label>Площадь (м²)</Label>
              <Input
                type="number"
                value={form.totalArea}
                onChange={(e) => setForm({ ...form, totalArea: e.target.value })}
                placeholder="45000"
              />
            </div>
          </div>
          <div>
            <Label>Статус</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Строится</SelectItem>
                <SelectItem value="COMPLETED">Сдан</SelectItem>
                <SelectItem value="PLANNED">Планируется</SelectItem>
                <SelectItem value="SUSPENDED">Приостановлен</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Диалог создания плана работ
interface PlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  directions: WorkDirection[]
  buildings: Building[]
  plan?: WorkPlan | null
  onSuccess: () => void
}

export function PlanDialog({ open, onOpenChange, directions, buildings, plan, onSuccess }: PlanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: plan?.name || '',
    contractNumber: plan?.contractNumber || '',
    workDirectionId: plan?.workDirectionId || '',
    buildingId: plan?.buildingId || '',
    startDate: plan?.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '',
    endDate: plan?.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '',
    totalAmount: plan?.totalAmount || '',
    notes: plan?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.workDirectionId || !form.buildingId) {
      toast.error('Выберите направление и объект')
      return
    }
    setLoading(true)
    try {
      const url = plan ? `/api/plans/${plan.id}` : '/api/plans'
      const method = plan ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          totalAmount: form.totalAmount ? parseFloat(form.totalAmount as string) : 0,
        }),
      })
      
      if (res.ok) {
        toast.success(plan ? 'План обновлен' : 'План создан')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error('Ошибка сохранения')
      }
    } catch {
      toast.error('Ошибка соединения')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan ? 'Редактировать план работ' : 'Новый план работ'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Монтаж сетей связи - Корпус 1"
              required
            />
          </div>
          <div>
            <Label>Номер контракта</Label>
            <Input
              value={form.contractNumber}
              onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
              placeholder="ДС-001/2024"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Направление работ</Label>
              <Select value={form.workDirectionId} onValueChange={(value) => setForm({ ...form, workDirectionId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите..." />
                </SelectTrigger>
                <SelectContent>
                  {directions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Объект</Label>
              <Select value={form.buildingId} onValueChange={(value) => setForm({ ...form, buildingId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите..." />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Дата окончания</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Сумма контракта (₽)</Label>
            <Input
              type="number"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              placeholder="12500000"
            />
          </div>
          <div>
            <Label>Примечания</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Дополнительная информация..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Диалог создания сотрудника
interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  onSuccess: () => void
}

export function EmployeeDialog({ open, onOpenChange, employee, onSuccess }: EmployeeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: employee?.fullName || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    position: employee?.position || '',
    specialty: employee?.specialty || '',
    hourlyRate: employee?.hourlyRate || '',
    monthlySalary: employee?.monthlySalary || '',
    status: employee?.status || 'ACTIVE',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees'
      const method = employee ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate as string) : 0,
          monthlySalary: form.monthlySalary ? parseFloat(form.monthlySalary as string) : 0,
          shortName: form.fullName.split(' ').map((n, i) => i === 0 ? n : n[0] + '.').join(' '),
        }),
      })
      
      if (res.ok) {
        toast.success(employee ? 'Сотрудник обновлен' : 'Сотрудник добавлен')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error('Ошибка сохранения')
      }
    } catch {
      toast.error('Ошибка соединения')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>ФИО</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Телефон</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Должность</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Монтажник"
              />
            </div>
            <div>
              <Label>Специальность</Label>
              <Input
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                placeholder="Электромонтажник"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Почасовая ставка (₽)</Label>
              <Input
                type="number"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                placeholder="450"
              />
            </div>
            <div>
              <Label>Месячный оклад (₽)</Label>
              <Input
                type="number"
                value={form.monthlySalary}
                onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
                placeholder="75000"
              />
            </div>
          </div>
          <div>
            <Label>Статус</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Работает</SelectItem>
                <SelectItem value="VACATION">В отпуске</SelectItem>
                <SelectItem value="SICK">На больничном</SelectItem>
                <SelectItem value="FIRED">Уволен</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Диалог создания наряда
interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workPlans: WorkPlan[]
  employees: Employee[]
  onSuccess: () => void
}

export function OrderDialog({ open, onOpenChange, workPlans, employees, onSuccess }: OrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    workPlanId: '',
    description: '',
    location: '',
    deadline: '',
    priority: '2',
    assigneeIds: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.workPlanId) {
      toast.error('Выберите план работ')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          priority: parseInt(form.priority),
          createdById: 'system',
        }),
      })
      
      if (res.ok) {
        toast.success('Наряд создан')
        onSuccess()
        onOpenChange(false)
        setForm({
          name: '',
          workPlanId: '',
          description: '',
          location: '',
          deadline: '',
          priority: '2',
          assigneeIds: [],
        })
      } else {
        toast.error('Ошибка создания')
      }
    } catch {
      toast.error('Ошибка соединения')
    }
    setLoading(false)
  }

  const toggleAssignee = (id: string) => {
    setForm({
      ...form,
      assigneeIds: form.assigneeIds.includes(id)
        ? form.assigneeIds.filter(a => a !== id)
        : [...form.assigneeIds, id]
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый наряд на монтаж</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Прокладка ВОЛС этажи 11-15"
              required
            />
          </div>
          <div>
            <Label>План работ</Label>
            <Select value={form.workPlanId} onValueChange={(value) => setForm({ ...form, workPlanId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите план..." />
              </SelectTrigger>
              <SelectContent>
                {workPlans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание работ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Место проведения</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Корпус 1, этажи 11-15"
              />
            </div>
            <div>
              <Label>Срок выполнения</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Приоритет</Label>
            <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Низкий</SelectItem>
                <SelectItem value="2">Средний</SelectItem>
                <SelectItem value="3">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Исполнители</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
              {employees.filter(e => e.status === 'ACTIVE').map((emp) => (
                <label
                  key={emp.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    form.assigneeIds.includes(emp.id) ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.assigneeIds.includes(emp.id)}
                    onChange={() => toggleAssignee(emp.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm truncate">{emp.shortName || emp.fullName}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать наряд'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
