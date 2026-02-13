// src/features/pivot/components/PivotTimeline.tsx
'use client'

import { PivotCycle } from '@prisma/client'
import { CurrentPhaseForm } from './CurrentPhaseForm'
import { addCycleToPhase } from '@/features/pivot/actions'
import { useState } from 'react'

type Props = {
  // プロジェクトIDが必要になったので追加
  // (親コンポーネントから渡す必要があります！後述)
  projectId: string 
  cycles: PivotCycle[]
}

export function PivotTimeline({ projectId, cycles }: Props) {
  const [isAdding, setIsAdding] = useState(false)

  // 1. データをフェーズごとにグループ化する魔法のロジック
  // 結果イメージ: { 3: [CycleA, CycleB], 2: [CycleC], ... }
  const cyclesByPhase = cycles.reduce((acc, cycle) => {
    const phase = cycle.phase
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(cycle)
    return acc
  }, {} as Record<number, PivotCycle[]>)

  // フェーズ番号の降順（新しい順 3 -> 2 -> 1）リストを作成
  const phases = Object.keys(cyclesByPhase)
    .map(Number)
    .sort((a, b) => b - a)

  // カード追加ハンドラ
  const handleAddCard = async (phase: number) => {
    setIsAdding(true)
    await addCycleToPhase(projectId, phase)
    setIsAdding(false)
  }

  return (
    <div className="relative pl-8 space-y-16">
      {/* 左側の縦線 (タイムラインの軸) */}
      <div className="absolute left-[11px] top-4 bottom-0 w-0.5 bg-gray-200" />

      {phases.map((phase) => {
        const phaseCycles = cyclesByPhase[phase]
        // 一番上のフェーズを「現在」とみなす
        const isCurrentPhase = phase === phases[0] 

        return (
          <div key={phase} className="relative">
            {/* --- フェーズヘッダー部分 --- */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* タイムラインのドット */}
                <div 
                  className={`absolute -left-[29px] w-6 h-6 rounded-full border-4 border-white z-10 transition-all
                    ${isCurrentPhase ? 'bg-blue-500 ring-4 ring-blue-100 scale-110' : 'bg-gray-400'}
                  `}
                />
                <h2 className={`text-2xl font-bold tracking-tight ${isCurrentPhase ? 'text-blue-600' : 'text-gray-500'}`}>
                  Phase {phase}
                </h2>
              </div>
              
              {/* 「＋ 取り組みを追加」ボタン (現在のフェーズのみ表示) */}
              {isCurrentPhase && (
                <button 
                  onClick={() => handleAddCard(phase)}
                  disabled={isAdding}
                  className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition-colors shadow-sm"
                >
                  {isAdding ? '追加中...' : '＋ 取り組みを追加'}
                </button>
              )}
            </div>

            {/* --- カードリスト部分 (グリッド表示) --- */}
            <div className="grid grid-cols-1 gap-6">
              {phaseCycles.map((cycle) => (
                <div key={cycle.id}>
                  {/* すべてのカードを「CurrentPhaseForm」で表示することで、
                    過去分も含めていつでも編集・削除が可能になります。
                    (isEditableフラグ等は不要、サーバー側で制限がなければ編集できます)
                  */}
                  <CurrentPhaseForm cycle={cycle} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
