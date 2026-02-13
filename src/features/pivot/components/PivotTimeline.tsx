'use client'

import { PivotCycle, Feedback } from '@prisma/client'
import { CurrentPhaseForm } from './CurrentPhaseForm'
import { addCycleToPhase } from '@/features/pivot/actions'
import { useState } from 'react'

type CycleWithFeedback = PivotCycle & {
  feedbacks: Feedback[]
}

type Props = {
  projectId: string 
  cycles: CycleWithFeedback[]
}

export function PivotTimeline({ projectId, cycles }: Props) {
  const [isAdding, setIsAdding] = useState(false)

  const cyclesByPhase = cycles.reduce((acc, cycle) => {
    const phase = cycle.phase
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(cycle)
    return acc
  }, {} as Record<number, CycleWithFeedback[]>)

  const phases = Object.keys(cyclesByPhase)
    .map(Number)
    .sort((a, b) => b - a)

  const handleAddCard = async (phase: number) => {
    setIsAdding(true)
    await addCycleToPhase(projectId, phase)
    setIsAdding(false)
  }

  return (
    <div className="relative pl-8 space-y-16">
      <div className="absolute left-[11px] top-4 bottom-0 w-0.5 bg-gray-200" />

      {phases.map((phase) => {
        const phaseCycles = cyclesByPhase[phase]
        const isCurrentPhase = phase === phases[0] 

        return (
          <div key={phase} className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div 
                  className={`absolute -left-[29px] w-6 h-6 rounded-full border-4 border-white z-10 transition-all
                    ${isCurrentPhase ? 'bg-blue-500 ring-4 ring-blue-100 scale-110' : 'bg-gray-400'}
                  `}
                />
                <h2 className={`text-2xl font-bold tracking-tight ${isCurrentPhase ? 'text-blue-600' : 'text-gray-500'}`}>
                  Phase {phase}
                </h2>
              </div>
              
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

            <div className="grid grid-cols-1 gap-6">
              {phaseCycles.map((cycle) => (
                <div key={cycle.id}>
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
