# ПОЛНЫЙ ПРОМПТ ДЛЯ ВОССТАНОВЛЕНИЯ СЕССИИ
## СтройКомплекс - Система управления строительными проектами

Копируй этот текст в начало новой сессии:

---

## ПРОЕКТ: СтройКомплекс

### Описание
Система управления строительными проектами для монтажа сетей связи, АСПЗ, вентиляции.
Технологии: Next.js 15, Prisma, SQLite, Zustand, Shadcn/UI, Docker

---

## ДОСТУПЫ

### VPS Сервер
- Host: 155.212.222.189
- User: root
- Password: Russia03!!!
- URL: http://155.212.222.189:3000

### GitHub
- Репозиторий: https://github.com/grandallboss-svg/stroycomplex
- Токен: ghp_xxxxxxxxx (нужно получить через GitHub Settings -> Developer settings -> Personal access tokens)
- Команда для клона:
  git clone https://github.com/grandallboss-svg/stroycomplex.git

### Вход в приложение
- Email: admin@stroytest.ru
- Password: admin123

---

## КОМАНДЫ ДЛЯ РАБОТЫ

### SSH подключение к VPS
```bash
ssh root@155.212.222.189
# пароль: Russia03!!!
```

### Деплой на VPS
```bash
# На сервере
cd /root/stroycomplex
git pull
docker-compose down
docker-compose up -d --build
```

### Команды проекта
```bash
bun run lint        # Проверка кода
bunx prisma generate # Генерация клиента
bunx prisma db push  # Применение схемы БД
```

---

## ВЫПОЛНЕННЫЕ ЗАДАЧИ

1. **Направления работ**
   - Кнопка "Изменить" - диалог (название, код, описание, цвет)
   - Кнопка "Удалить" - с подтверждением и каскадным удалением

2. **Объекты строительства**
   - Кнопка "Изменить" - диалог (название, адрес, этажи, статус)
   - Кнопка "Удалить" - с подтверждением и каскадным удалением

3. **План работ**
   - Этапы работ - добавление нескольких этапов
   - Состав работ внутри этапа (наименование, единица, количество, цена)
   - Импорт работ из нарядов

4. **Настройки**
   - Статистика базы данных
   - "Загрузить демо" - демо-данные
   - "Очистить базу" - очистка всех данных
   - "Скачать бэкап" - скачивание файла БД

---

## КЛЮЧЕВЫЕ ФАЙЛЫ

### Frontend
- /home/z/my-project/src/app/page.tsx - Основной UI (~4200 строк)
- /home/z/my-project/src/lib/store.ts - Zustand store

### Backend API
- /home/z/my-project/src/app/api/plans/route.ts - Создание планов с этапами
- /home/z/my-project/src/app/api/plans/[id]/route.ts - Каскадное обновление
- /home/z/my-project/src/app/api/directions/[id]/route.ts - CRUD направлений
- /home/z/my-project/src/app/api/buildings/[id]/route.ts - CRUD объектов
- /home/z/my-project/src/app/api/settings/database/route.ts - Управление БД
- /home/z/my-project/src/app/api/settings/backup/route.ts - Бэкап БД
- /home/z/my-project/src/app/api/orders/route.ts - Наряды
- /home/z/my-project/src/app/api/documents/ks2/route.ts - Документы КС-2

### Database
- /home/z/my-project/prisma/schema.prisma - Схема БД (модель Work добавлена)
- /home/z/my-project/db/custom.db - Файл базы данных SQLite

### Конфигурация
- /home/z/my-project/Dockerfile - Docker конфигурация
- /home/z/my-project/docker-compose.yml - Docker Compose
- /home/z/my-project/package.json - Зависимости

---

## СТРУКТУРА БАЗЫ ДАННЫХ

### Основные модели
- User - Пользователи
- WorkDirection - Направления работ
- Building - Объекты строительства
- WorkPlan - План работ
- WorkStage - Этапы работ
- Work - Состав работ (внутри этапа)
- DocumentKS2 - Документы КС-2
- DocumentKS3 - Документы КС-3
- HiddenWorkAct - Акты скрытых работ
- Employee - Персонал
- SalaryPayment - Зарплата
- InstallationOrder - Наряды на монтаж
- OrderItem - Позиции наряда
- SafetyBriefing - Инструктажи
- SafetyRecord - Записи инструктажей

---

## ПРИОРИТЕТНЫЕ ЗАДАЧИ ДЛЯ ПРОДОЛЖЕНИЯ

1. Проверить состояние файлов после обнуления песочницы
2. Если файлы сброшены - восстановить из GitHub
3. Применить миграции Prisma если нужно
4. Протестировать функционал на VPS

---

## РЕЗЕРВНЫЕ КОПИИ НА VPS

На VPS в /root/stroycomplex-backups/:
- SESSION_CONTEXT.md - Контекст сессии
- FULL_RESTORE_PROMPT.md - Этот файл
- worklog_*.md - Журналы работ

Команда для чтения с VPS через SSH:
```bash
ssh root@155.212.222.189 "cat /root/stroycomplex-backups/FULL_RESTORE_PROMPT.md"
```

---

## ИНСТРУКЦИЯ ДЛЯ НОВОЙ СЕССИИ

1. Скопировать содержимое этого файла в промпт
2. Попросить агента проверить состояние файлов через LS/Read
3. Если проект пустой - клонировать с GitHub
4. Если есть файлы - проверить page.tsx на наличие нужного функционала
5. При необходимости восстановить утраченный функционал

---
