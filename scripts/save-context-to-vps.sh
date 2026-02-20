#!/bin/bash
# Скрипт для сохранения контекста сессии на VPS сервер
# Запускать периодически или после важных изменений

# SSH настройки
VPS_HOST="155.212.222.189"
VPS_USER="root"
VPS_PASS="Russia03!!!"
BACKUP_DIR="/root/stroycomplex-backups"

# Создаём директорию если нет
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "mkdir -p $BACKUP_DIR"

# Сохраняем контекст с датой
DATE=$(date +%Y%m%d_%H%M%S)

# Копируем файлы контекста
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no \
  /home/z/my-project/SESSION_CONTEXT.md \
  $VPS_USER@$VPS_HOST:$BACKUP_DIR/SESSION_CONTEXT_$DATE.md

sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no \
  /home/z/my-project/worklog.md \
  $VPS_USER@$VPS_HOST:$BACKUP_DIR/worklog_$DATE.md

echo "Context saved to VPS at $DATE"
