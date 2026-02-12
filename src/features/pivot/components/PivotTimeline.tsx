// src/features/pivot/components/PivotTimeline.tsx
'use client'

import { PivotCycle } from '@prisma/client'
import { CurrentPhaseForm } from './CurrentPhaseForm'
import { addCycleToPhase } from '@/features/pivot/actions'

type Props = {
  projectId: string
  cycles: PivotCycle[]
}

export function PivotTimeline({ projectId, cycles }: Props) {
  // 1. データをフェーズごとにグループ化する
  // 結果: { 3: [Cycle, Cycle], 2: [Cycle], 1: [Cycle] }
  const cyclesByPhase = cycles.reduce((acc, cycle) => {
    const phase = cycle.phase
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(cycle)
    return acc
  }, {} as Record<number, PivotCycle[]>)

  // フェーズ番号の降順（新しい順）リストを作成
  const phases = Object.keys(cyclesByPhase)
    .map(Number)
    .sort((a, b) => b - a)

  const handleAddCard = async (phase: number) => {
    await addCycleToPhase(projectId, phase)
  }

  return (
    <div className="relative pl-8 space-y-16">
      {/* 左側の縦線 */}
      <div className="absolute left-[11px] top-4 bottom-0 w-0.5 bg-gray-200" />

      {phases.map((phase) => {
        const phaseCycles = cyclesByPhase[phase]
        const isCurrentPhase = phase === phases[0] // 一番上が現在のフェーズ

        return (
          <div key={phase} className="relative">
            {/* フェーズのラベルと追加ボタン */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* タイムラインのドット */}
                <div 
                  className={`absolute -left-[29px] w-6 h-6 rounded-full border-4 border-white z-10 
                    ${isCurrentPhase ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-gray-400'}
                  `}
                />
                <h2 className={`text-xl font-bold ${isCurrentPhase ? 'text-blue-600' : 'text-gray-500'}`}>
                  Phase {phase}
                </h2>
              </div>
              
              {/* 「＋ このフェーズにカードを追加」ボタン */}
              {isCurrentPhase && (
                <button 
                  onClick={() => handleAddCard(phase)}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-bold transition-colors"
                >
                  ＋ 取り組みを追加
                </button>
              )}
            </div>

            {/* カードのリスト（グリッド表示） */}
            <div className="grid grid-cols-1 gap-6">
              {phaseCycles.map((cycle) => (
                <div key={cycle.id}>
                  {/* 現在のフェーズ、または「未完了」のカードは編集フォームを表示
                     過去のフェーズでも、編集したい場合はフォームモードにするUIが必要ですが、
                     まずは「CurrentPhaseForm」を再利用して、常に編集可能にしてしまうのが一番早いです。
                  */}
                  <CurrentPhaseForm cycle={cycle} isEditable={true} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
