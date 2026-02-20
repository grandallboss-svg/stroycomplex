import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/plans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plan = await db.workPlan.findUnique({
      where: { id },
      include: {
        workDirection: true,
        building: true,
        stages: {
          orderBy: { order: 'asc' },
          include: {
            works: { orderBy: { order: 'asc' } }
          }
        },
        documentsKS2: { orderBy: { period: 'desc' } },
        documentsKS3: { orderBy: { period: 'desc' } },
        hiddenWorkActs: true,
        orders: {
          include: {
            assignees: { include: { employee: true } }
          }
        }
      }
    })
    if (!plan) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения' }, { status: 500 })
  }
}

// PUT /api/plans/[id] - Обновление плана с этапами и работами
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Если переданы этапы - обновляем каскадно
    if (data.stages !== undefined) {
      // Получаем текущие этапы
      const currentStages = await db.workStage.findMany({
        where: { workPlanId: id },
        include: { works: true }
      })
      
      const currentStageIds = currentStages.map(s => s.id)
      const newStageIds = (data.stages || []).map((s: { id?: string }) => s.id).filter(Boolean)
      
      // Удаляем этапы, которых больше нет
      const stagesToDelete = currentStageIds.filter(sid => !newStageIds.includes(sid))
      if (stagesToDelete.length > 0) {
        await db.workStage.deleteMany({
          where: { id: { in: stagesToDelete } }
        })
      }
      
      // Обновляем или создаём этапы
      for (let idx = 0; idx < (data.stages || []).length; idx++) {
        const stage = data.stages[idx]
        
        if (stage.id && currentStageIds.includes(stage.id)) {
          // Обновляем существующий этап
          await db.workStage.update({
            where: { id: stage.id },
            data: {
              name: stage.name,
              description: stage.description,
              order: idx,
              startDate: stage.startDate ? new Date(stage.startDate) : null,
              endDate: stage.endDate ? new Date(stage.endDate) : null,
              plannedAmount: stage.plannedAmount || 0,
              status: stage.status || 'PENDING'
            }
          })
          
          // Обновляем работы этапа
          if (stage.works !== undefined) {
            const currentWorks = await db.work.findMany({
              where: { workStageId: stage.id }
            })
            const currentWorkIds = currentWorks.map(w => w.id)
            const newWorkIds = (stage.works || []).map((w: { id?: string }) => w.id).filter(Boolean)
            
            // Удаляем работы, которых больше нет
            const worksToDelete = currentWorkIds.filter(wid => !newWorkIds.includes(wid))
            if (worksToDelete.length > 0) {
              await db.work.deleteMany({
                where: { id: { in: worksToDelete } }
              })
            }
            
            // Обновляем или создаём работы
            for (let widx = 0; widx < (stage.works || []).length; widx++) {
              const work = stage.works[widx]
              
              if (work.id && currentWorkIds.includes(work.id)) {
                await db.work.update({
                  where: { id: work.id },
                  data: {
                    name: work.name,
                    unit: work.unit || 'шт',
                    quantity: work.quantity || 1,
                    unitPrice: work.unitPrice || 0,
                    order: widx
                  }
                })
              } else {
                await db.work.create({
                  data: {
                    workStageId: stage.id,
                    name: work.name,
                    unit: work.unit || 'шт',
                    quantity: work.quantity || 1,
                    unitPrice: work.unitPrice || 0,
                    order: widx
                  }
                })
              }
            }
          }
        } else {
          // Создаём новый этап
          const newStage = await db.workStage.create({
            data: {
              workPlanId: id,
              name: stage.name,
              description: stage.description,
              order: idx,
              startDate: stage.startDate ? new Date(stage.startDate) : null,
              endDate: stage.endDate ? new Date(stage.endDate) : null,
              plannedAmount: stage.plannedAmount || 0,
              status: stage.status || 'PENDING'
            }
          })
          
          // Создаём работы нового этапа
          if (stage.works && stage.works.length > 0) {
            await db.work.createMany({
              data: stage.works.map((work: { name: string; unit: string; quantity: number; unitPrice: number }, widx: number) => ({
                workStageId: newStage.id,
                name: work.name,
                unit: work.unit || 'шт',
                quantity: work.quantity || 1,
                unitPrice: work.unitPrice || 0,
                order: widx
              }))
            })
          }
        }
      }
    }
    
    // Обновляем основные поля плана
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.contractNumber !== undefined) updateData.contractNumber = data.contractNumber
    if (data.workDirectionId !== undefined) updateData.workDirectionId = data.workDirectionId
    if (data.buildingId !== undefined) updateData.buildingId = data.buildingId
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount
    if (data.status !== undefined) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes
    
    const plan = await db.workPlan.update({
      where: { id },
      data: updateData,
      include: {
        workDirection: true,
        building: true,
        stages: {
          orderBy: { order: 'asc' },
          include: { works: { orderBy: { order: 'asc' } } }
        }
      }
    })
    
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

// DELETE /api/plans/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.workPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
