'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PivotDecision } from '@prisma/client'

/**
 * ピボット実行アクション
 * 1. 現在のサイクルを「完了」にし、意思決定（PIVOT/PERSEVERE）を保存
 * 2. もし「PIVOT」なら、次のフェーズ（phase + 1）を新規作成
 */
export async function executePivot(
  cycleId: string, 
  projectId: string, 
  currentPhase: number, 
  decision: PivotDecision
) {
  // Prismaのトランザクション: 途中で失敗したら全部ロールバックされる
  await prisma.$transaction(async (tx) => {
    
    // 1. 現在のサイクルをクローズする
    await tx.pivotCycle.update({
      where: { id: cycleId },
      data: {
        status: 'COMPLETED',
        decision: decision,
      },
    })

    // 2. 「撤退(KILL)」でなければ、次のサイクルを作る
    if (decision !== 'KILL') {
      await tx.pivotCycle.create({
        data: {
          projectId: projectId,
          phase: currentPhase + 1,
          status: 'DRAFT',
          hypothesis: '',
        },
      })
    }
  })

  // 画面を更新（キャッシュをクリアして最新データを再取得）
  revalidatePath('/')
}



/**
 * 日々の進捗保存アクション
 * 仮説や行動ログを更新するだけ（トランザクション不要）
 */
export async function updateCycleProgress(cycleId: string, formData: FormData) {
  const hypothesis = formData.get('hypothesis') as string
  const action = formData.get('action') as string
  const result = formData.get('result') as string
  const learning = formData.get('learning') as string

  await prisma.pivotCycle.update({
    where: { id: cycleId },
    data: {
      hypothesis,
      action,
      result,
      learning,
    },
  })

  revalidatePath('/')
}
