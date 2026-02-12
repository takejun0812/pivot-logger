'use client'

import { PivotCycle, PivotDecision } from '@prisma/client'
import { updateCycleProgress, executePivot, deleteCycle } from '@/features/pivot/actions'
import { useState } from 'react'

type Props = {
  cycle: PivotCycle
  isEditable?: boolean
}

export function CurrentPhaseForm({ cycle }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const updateAction = updateCycleProgress.bind(null, cycle.id)
  
  // 削除ハンドラ
  const handleDelete = async () => {
    if (!confirm('本当にこのカードを削除しますか？')) return
    await deleteCycle(cycle.id)
  }

  // 決断ハンドラ (Pivot/Persevere)
  const handleDecision = async (decision: PivotDecision) => {

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 保存用アクション (テキスト入力の保存)
  const updateAction = updateCycleProgress.bind(null, cycle.id)

  // 決断用アクション (ボタンを押した時の処理)
  const handleDecision = async (decision: PivotDecision) => {
    if (!confirm('このフェーズを終了し、次のステップへ進みますか？\n（この操作は取り消せません）')) {
      return
    }

    setIsSubmitting(true)
    try {
      // Day 2で作った executePivot を呼び出す
      await executePivot(cycle.id, cycle.projectId, cycle.phase, decision)
    } catch (error) {
      alert('エラーが発生しました')
      setIsSubmitting(false)
    }
  }
  if (!confirm('次のフェーズへ進みますか？')) return
     await executePivot(cycle.id, cycle.projectId, cycle.phase, decision)
  }

  // ステータスの色定義
  const statusColor = cycle.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
  const isCompleted = cycle.status === 'COMPLETED'

  return (
    <div className={`relative rounded-xl border-2 shadow-sm bg-white transition-all
      ${isCompleted ? 'border-gray-200 opacity-90' : 'border-blue-500 shadow-lg'}
    `}>
      {/* ヘッダー: ステータスと削除ボタン */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor}`}>
          {cycle.status}
        </span>
        
        <button 
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="削除"
        >
          🗑️
        </button>
      </div>

      <form action={updateAction} className="p-6">
        <div className="space-y-4">
          {/* 各入力フィールド (textarea) */}
          {/* 編集可能にするため、disabledにはしない */}
          <div>
            <label className="text-xs font-bold text-gray-500">仮説 / 取り組み内容</label>
            <textarea
              name="hypothesis"
              defaultValue={cycle.hypothesis || ''}
              className="w-full mt-1 p-2 text-black border border-black rounded focus:ring-2 focus:ring-blue-500 text-sm"
              rows={2}
            />
          </div>
          {/* Action, Result も同様に ... */}
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="text-sm text-blue-600 hover:text-blue-800 font-bold">
              {isCompleted ? '修正して保存' : '進捗を保存'}
            </button>
          </div>
        </div>
      </form>

      {/* 決断ボタンエリア（完了していない場合のみ表示） */}
      {!isCompleted && (
        <div className="p-4 border-t text-black font-bold border-black bg-gray-50 rounded-b-xl grid grid-cols-2 gap-3">
          <button onClick={() => handleDecision('PIVOT')} className="...">
            ⚡️ PIVOT
          </button>
          <button onClick={() => handleDecision('PERSEVERE')} className="...">
             🚀 次へ
          </button>
        </div>
      )}
    </div>
  )
}
