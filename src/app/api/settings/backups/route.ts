import { NextResponse } from 'next/server'
import { readdir, stat, copyFile, mkdir, unlink, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DB_PATH = path.join(process.cwd(), 'db', 'custom.db')
const BACKUPS_DIR = path.join(process.cwd(), 'backups')

// Убедиться, что папка бэкапов существует
async function ensureBackupsDir() {
  if (!existsSync(BACKUPS_DIR)) {
    await mkdir(BACKUPS_DIR, { recursive: true })
  }
}

// GET - Получить список всех бэкапов
export async function GET() {
  try {
    await ensureBackupsDir()
    
    const files = await readdir(BACKUPS_DIR)
    const backups = []
    
    for (const file of files) {
      if (file.endsWith('.db')) {
        const filePath = path.join(BACKUPS_DIR, file)
        const stats = await stat(filePath)
        const id = file.replace('.db', '')
        
        // Проверяем, активен ли этот бэкап (совпадает ли с текущей БД)
        let isActive = false
        try {
          const currentDb = await readFile(DB_PATH)
          const backupDb = await readFile(filePath)
          isActive = currentDb.equals(backupDb)
        } catch {
          // Игнорируем ошибки сравнения
        }
        
        backups.push({
          id,
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          isActive
        })
      }
    }
    
    // Сортируем по дате создания (новые сначала)
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json(backups)
  } catch (error) {
    console.error('List backups error:', error)
    return NextResponse.json({ error: 'Ошибка получения списка бэкапов' }, { status: 500 })
  }
}

// POST - Создать новый бэкап или загрузить существующий
export async function POST(request: Request) {
  try {
    await ensureBackupsDir()
    
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Загрузка файла бэкапа
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const name = formData.get('name') as string | null
      
      if (!file) {
        return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
      }
      
      // Проверяем расширение файла
      if (!file.name.endsWith('.db')) {
        return NextResponse.json({ error: 'Файл должен иметь расширение .db' }, { status: 400 })
      }
      
      const buffer = Buffer.from(await file.arrayBuffer())
      const backupId = name || `${new Date().toISOString().split('T')[0]}-${uuidv4().split('-')[0]}`
      const backupPath = path.join(BACKUPS_DIR, `${backupId}.db`)
      
      // Сохраняем файл
      const { writeFile } = await import('fs/promises')
      await writeFile(backupPath, buffer)
      
      return NextResponse.json({ 
        message: 'Бэкап загружен', 
        backup: { 
          id: backupId, 
          filename: `${backupId}.db`,
          size: file.size 
        } 
      })
    } else {
      // Создание бэкапа текущей базы
      const body = await request.json().catch(() => ({}))
      const name = body.name || `${new Date().toISOString().split('T')[0]}-${uuidv4().split('-')[0]}`
      const backupPath = path.join(BACKUPS_DIR, `${name}.db`)
      
      await copyFile(DB_PATH, backupPath)
      
      const stats = await stat(backupPath)
      
      return NextResponse.json({ 
        message: 'Бэкап создан', 
        backup: { 
          id: name, 
          filename: `${name}.db`,
          size: stats.size 
        } 
      })
    }
  } catch (error) {
    console.error('Create backup error:', error)
    return NextResponse.json({ error: 'Ошибка создания бэкапа' }, { status: 500 })
  }
}
