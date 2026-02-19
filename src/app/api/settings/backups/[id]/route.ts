import { NextResponse } from 'next/server'
import { stat, copyFile, unlink, existsSync } from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'db', 'custom.db')
const BACKUPS_DIR = path.join(process.cwd(), 'backups')

// POST - Активировать бэкап (переключиться на него)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backupPath = path.join(BACKUPS_DIR, `${id}.db`)
    
    if (!existsSync(backupPath)) {
      return NextResponse.json({ error: 'Бэкап не найден' }, { status: 404 })
    }
    
    // Создаем резервную копию текущей БД перед переключением
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const currentBackupPath = path.join(BACKUPS_DIR, `auto-before-switch-${timestamp}.db`)
    
    if (existsSync(DB_PATH)) {
      await copyFile(DB_PATH, currentBackupPath)
    }
    
    // Копируем выбранный бэкап в основную БД
    await copyFile(backupPath, DB_PATH)
    
    return NextResponse.json({ 
      message: 'Бэкап активирован. Перезагрузите приложение.',
      autoBackup: `auto-before-switch-${timestamp}.db`
    })
  } catch (error) {
    console.error('Activate backup error:', error)
    return NextResponse.json({ error: 'Ошибка активации бэкапа' }, { status: 500 })
  }
}

// DELETE - Удалить бэкап
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backupPath = path.join(BACKUPS_DIR, `${id}.db`)
    
    if (!existsSync(backupPath)) {
      return NextResponse.json({ error: 'Бэкап не найден' }, { status: 404 })
    }
    
    // Проверяем, не является ли бэкап активным
    const dbBuffer = await import('fs/promises').then(fs => fs.readFile(DB_PATH))
    const backupBuffer = await import('fs/promises').then(fs => fs.readFile(backupPath))
    
    if (dbBuffer.equals(backupBuffer)) {
      return NextResponse.json({ error: 'Нельзя удалить активный бэкап' }, { status: 400 })
    }
    
    await unlink(backupPath)
    
    return NextResponse.json({ message: 'Бэкап удален' })
  } catch (error) {
    console.error('Delete backup error:', error)
    return NextResponse.json({ error: 'Ошибка удаления бэкапа' }, { status: 500 })
  }
}

// GET - Скачать бэкап
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backupPath = path.join(BACKUPS_DIR, `${id}.db`)
    
    if (!existsSync(backupPath)) {
      return NextResponse.json({ error: 'Бэкап не найден' }, { status: 404 })
    }
    
    const fileBuffer = await import('fs/promises').then(fs => fs.readFile(backupPath))
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${id}.db"`,
      },
    })
  } catch (error) {
    console.error('Download backup error:', error)
    return NextResponse.json({ error: 'Ошибка скачивания бэкапа' }, { status: 500 })
  }
}
