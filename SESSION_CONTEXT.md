# СтройКомплекс - Контекст сессии

## Дата последнего обновления
2024-01-XX

## Выполненные задачи

### 1. Исправлена ошибка обновления статуса плана работ
- API `/api/plans/[id]` теперь поддерживает частичные обновления

### 2. Добавлен функционал "Состав работ" для планов
- Новая модель `Work` в Prisma схеме (файл: prisma/schema.prisma)
- API endpoints:
  - `/api/works/route.ts` - создание и получение работ
  - `/api/works/[id]/route.ts` - CRUD для работ
- UI для создания этапов и работ при создании плана
- Импорт работ из нарядов

### 3. Добавлено редактирование и удаление для направлений
- Диалог редактирования: название, код, описание, цвет
- Диалог удаления с подтверждением и каскадным удалением проектов

### 4. Добавлено редактирование и удаление для объектов
- Диалог редактирования: название, адрес, этажи, статус
- Диалог удаления с подтверждением и каскадным удалением проектов

### 5. Добавлено управление базой данных в Настройках
- Статистика данных (направления, объекты, планы, сотрудники, наряды)
- Кнопка "Загрузить демо" - загружает демо-данные
- Кнопка "Очистить базу" - очищает все данные
- Кнопка "Скачать бэкап" - скачивает файл базы данных

## Ключевые файлы

### Frontend
- `/home/z/my-project/src/app/page.tsx` - Основной UI (4200+ строк)
  - LoginForm - форма входа
  - Sidebar - боковое меню
  - CreateDialog - универсальный диалог создания
  - DirectionsSection - раздел направлений
  - BuildingsSection - раздел объектов
  - PlansSection - раздел планов работ
  - EditPlanForm - форма редактирования плана с этапами и работами
  - KS2Section - документы КС-2
  - KS3Section - документы КС-3
  - HiddenActsSection - акты скрытых работ
  - EmployeesSection - персонал
  - SalarySection - зарплата
  - OrdersSection - наряды
  - SafetySection - техника безопасности
  - SettingsSection - настройки с управлением БД

### Backend API
- `/home/z/my-project/src/app/api/plans/route.ts` - Создание планов с этапами и работами
- `/home/z/my-project/src/app/api/plans/[id]/route.ts` - CRUD планов с каскадным обновлением этапов
- `/home/z/my-project/src/app/api/directions/[id]/route.ts` - CRUD направлений
- `/home/z/my-project/src/app/api/buildings/[id]/route.ts` - CRUD объектов
- `/home/z/my-project/src/app/api/settings/database/route.ts` - Управление базой данных
- `/home/z/my-project/src/app/api/settings/backup/route.ts` - Бэкап базы данных
- `/home/z/my-project/src/app/api/settings/reload/route.ts` - Перезагрузка приложения

### Database
- `/home/z/my-project/prisma/schema.prisma` - Схема БД с моделью Work

## Типы данных

### StageType (для создания плана)
```typescript
type StageType = {
  id?: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  plannedAmount?: number
  works: { name: string; unit: string; quantity: number; unitPrice: number }[]
}
```

### EditStageType (для редактирования плана)
```typescript
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
```

## Деплой
- **VPS:** http://155.212.222.189:3000
- **GitHub:** https://github.com/grandallboss-svg/stroycomplex
- **Вход:** admin@stroytest.ru / admin123

## SSH подключение
```javascript
// /home/z/my-project/ssh-cmd.mjs
const host = '155.212.222.189'
const user = 'root'
const password = 'Russia03!!!'
```

## Как восстановить

1. Скопировать этот файл в новую сессию
2. Проверить состояние файлов через Read tool
3. Если файлы сброшены - применить изменения из этого контекста

## Команды для проверки
```bash
# Проверка lint
bun run lint

# Генерация Prisma клиента
bunx prisma generate

# Применение схемы к БД
bunx prisma db push
```
