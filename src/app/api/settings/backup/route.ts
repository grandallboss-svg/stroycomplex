import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'custom.db')
    const fileBuffer = await readFile(dbPath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="stroycomplex-backup-${new Date().toISOString().split('T')[0]}.db"`,
      },
    })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Ошибка создания бэкапа' }, { status: 500 })
  }
}
