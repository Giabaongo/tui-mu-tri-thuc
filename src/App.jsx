import { useState, useEffect } from 'react'
import { QUESTIONS } from './data/questions'
import { REWARDS } from './data/rewards'
import { INIT_TEAMS, NUM_Q, NUM_R } from './data/teams'
import { beep } from './utils/audio'
import Confetti from './components/Confetti'
import TeamCard from './components/TeamCard'
import QBag from './components/QBag'
import RBag from './components/RBag'
import QuestionModal from './components/modals/QuestionModal'
import ResultModal from './components/modals/ResultModal'
import RewardRevealModal from './components/modals/RewardRevealModal'
import TargetModal from './components/modals/TargetModal'
import ManualModal from './components/modals/ManualModal'

export default function App() {
  const [teams, setTeams] = useState(INIT_TEAMS.map(t => ({ ...t })))
  const [usedQBags, setUsedQBags] = useState(new Set())
  const [usedRBags, setUsedRBags] = useState(new Set())
  const [usedQIds, setUsedQIds] = useState(new Set())

  const [phase, setPhase] = useState('main') // main | question | result | reward_reveal
  const [curQ, setCurQ] = useState(null)
  const [curReward, setCurReward] = useState(null)
  const [ansTeamId, setAnsTeamId] = useState(null)
  const [winTeamId, setWinTeamId] = useState(null)
  const [resultCorrect, setResultCorrect] = useState(false)
  const [rewardOpen, setRewardOpen] = useState(false)

  const [lastReward, setLastReward] = useState(null)
  const [doubleNext, setDoubleNext] = useState(false)
  const [stealNextId, setStealNextId] = useState(null)

  const [celebrate, setCelebrate] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showTarget, setShowTarget] = useState(false)

  // Team pre-selected on main screen before opening a bag
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [needTeamWarning, setNeedTeamWarning] = useState(false)
  const [wrongTeamIds, setWrongTeamIds] = useState(new Set())

  // Warn before page refresh/close if game is in progress
  useEffect(() => {
    const handler = (e) => {
      const gameActive = usedQBags.size > 0 || teams.some(t => t.score !== 5)
      if (gameActive) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [usedQBags.size, teams])

  function pickQ() {
    const avail = QUESTIONS.filter(q => !usedQIds.has(q.id))
    const pool = avail.length > 0 ? avail : QUESTIONS
    return pool[Math.floor(Math.random() * pool.length)]
  }

  function openQBag(id) {
    const tid = stealNextId || selectedTeamId
    if (!tid) {
      setNeedTeamWarning(true)
      setTimeout(() => setNeedTeamWarning(false), 2500)
      return
    }
    beep('click')
    const q = pickQ()
    setUsedQIds(p => new Set([...p, q.id]))
    setUsedQBags(p => new Set([...p, id]))
    setCurQ(q)
    setAnsTeamId(tid)
    setStealNextId(null)
    setPhase('question')
  }

  function handleCorrect() {
    const tid = ansTeamId
    beep('correct')
    setTeams(prev => prev.map(t => t.id === tid ? { ...t, score: t.score + 2 } : t))
    setWinTeamId(tid); setResultCorrect(true); setRewardOpen(true)
    setCelebrate(true); setTimeout(() => setCelebrate(false), 2500)
    setPhase('result')
  }

  function handleWrong() {
    const tid = ansTeamId
    beep('wrong')
    setTeams(prev => prev.map(t => {
      if (t.id !== tid) return t
      if (t.shielded) return { ...t, shielded: false }
      return { ...t, score: t.score - 1 }
    }))
    const newWrongIds = new Set([...wrongTeamIds, tid])
    setWrongTeamIds(newWrongIds)
    const currentIdx = teams.findIndex(t => t.id === tid)
    let nextIdx = (currentIdx + 1) % teams.length
    for (let i = 0; i < teams.length; i++) {
      if (!newWrongIds.has(teams[nextIdx].id)) break
      nextIdx = (nextIdx + 1) % teams.length
    }
    if (!newWrongIds.has(teams[nextIdx].id)) setAnsTeamId(teams[nextIdx].id)
  }

  function dismissResult() {
    setPhase('main')
    setCurQ(null)
    setAnsTeamId(null)
    setSelectedTeamId(null)
    setWrongTeamIds(new Set())
  }

  function openRBag(id) {
    if (!rewardOpen) return
    beep('click')
    setUsedRBags(p => new Set([...p, id]))
    let r = REWARDS[Math.floor(Math.random() * REWARDS.length)]
    if (r.type === 'reuse_prev') {
      r = lastReward && lastReward.type !== 'reuse_prev'
        ? { ...lastReward, label: `♻️ ${lastReward.label}`, desc: `Dùng lại: ${lastReward.desc}` }
        : REWARDS.find(x => x.type === 'nothing')
    }
    setCurReward(r)
    setPhase('reward_reveal')
  }

  function handleApplyReward() {
    if (curReward.needsTarget) { setShowTarget(true); return }
    applyEffect(null)
  }

  function applyEffect(targetId) {
    const r = curReward
    const actId = winTeamId
    const doubled = doubleNext && r.type !== 'nothing' && r.type !== 'reverse'
    if (doubled) setDoubleNext(false)

    setTeams(prev => {
      const next = prev.map(t => ({ ...t }))
      const act = next.find(t => t.id === actId)
      const tgt = targetId ? next.find(t => t.id === targetId) : null

      switch (r.type) {
        case 'simple': {
          const v = doubled ? r.value * 2 : r.value
          if (act) { if (v < 0 && act.shielded) act.shielded = false; else act.score += v }
          break
        }
        case 'double_self':
          if (act) act.score = act.score * (doubled ? 3 : 2)
          break
        case 'halve_self':
          if (act) act.score = Math.floor(act.score / 2)
          break
        case 'swap':
          if (act && tgt) { const tmp = act.score; act.score = tgt.score; tgt.score = tmp }
          break
        case 'steal3':
          if (act && tgt) { const s = doubled ? 6 : 3; tgt.score -= s; act.score += s }
          break
        case 'give3get1':
          if (act && tgt) { act.score -= 3; act.score += doubled ? 2 : 1; tgt.score += 3 }
          break
        case 'bomb':
          if (act && tgt) { tgt.score = 0; if (act.shielded) act.shielded = false; else act.score -= 3 }
          break
        case 'minus2other':
          if (tgt) { const v = doubled ? 4 : 2; if (tgt.shielded) tgt.shielded = false; else tgt.score -= v }
          break
        case 'shield':
          if (act) act.shielded = true
          break
        case 'revive':
          if (act && act.score < 0) act.score = 0
          break
        case 'all_minus1_self_plus2':
          next.forEach(t => { if (t.shielded) t.shielded = false; else t.score -= 1 })
          if (act) act.score += 2
          break
        case 'give3get5':
          if (act && tgt) { act.score -= 3; tgt.score += 3; act.score += (doubled ? 10 : 5) }
          break
        case 'host_manage':
          break
        case 'reverse':
          if (act) act.score = -act.score
          break
        case 'steal_turn': setStealNextId(actId); break
        case 'double_next': setDoubleNext(true); break
        default: break
      }
      return next
    })

    setLastReward(r)
    setCurReward(null); setWinTeamId(null); setRewardOpen(false)
    setShowTarget(false); setPhase('main')
  }

  function handleDelta(teamId, delta) {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, score: t.score + delta } : t))
  }

  function resetGame() {
    if (!confirm('Reset toàn bộ game về trạng thái ban đầu?')) return
    setTeams(INIT_TEAMS.map(t => ({ ...t })))
    setUsedQBags(new Set()); setUsedRBags(new Set()); setUsedQIds(new Set())
    setPhase('main'); setCurQ(null); setCurReward(null)
    setAnsTeamId(null); setWinTeamId(null); setRewardOpen(false)
    setLastReward(null); setDoubleNext(false); setStealNextId(null)
    setCelebrate(false); setShowManual(false); setShowTarget(false)
    setSelectedTeamId(null); setNeedTeamWarning(false); setWrongTeamIds(new Set())
  }

  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <div style={{ minHeight: '100vh', padding: '12px 16px' }}>
      <Confetti on={celebrate} />

      {/* HEADER */}
      <div className="text-center mb-4">
        <div className="text-yellow-400 font-bold tracking-widest text-xs uppercase mb-0.5">
          Chủ nghĩa xã hội khoa học
        </div>
        <h1 className="text-white font-black tracking-tight"
          style={{ fontSize: 40, textShadow: '0 3px 18px rgba(255,215,0,0.55)' }}>
          🎒 TÚI MÙ TRI THỨC 🎒
        </h1>
        <div className="text-yellow-400/70 text-xs mt-0.5">
          Giai cấp công nhân · Sứ mệnh lịch sử · Công nhân 4.0
        </div>
      </div>

      {/* SCOREBOARD */}
      <div className="rounded-3xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(6px)' }}>
        <div className="flex items-start gap-3">
          <div className="flex gap-3 flex-1 justify-center flex-wrap">
            {teams.map(t => (
              <TeamCard key={t.id} team={t}
                active={phase === 'main' ? selectedTeamId === t.id : ansTeamId === t.id || winTeamId === t.id}
                onClick={() => {
                  if (phase === 'question') setAnsTeamId(t.id)
                  else if (phase === 'main') setSelectedTeamId(t.id)
                }}
                onDelta={handleDelta} />
            ))}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl text-xs transition-all active:scale-95 whitespace-nowrap"
              onClick={() => setShowManual(true)}>🔧 Chỉnh điểm</button>
            <button className="px-3 py-2 font-bold rounded-xl text-xs transition-all active:scale-95 text-white whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              onClick={resetGame}>🔄 Reset game</button>
          </div>
        </div>
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          {sorted.map((t, i) => (
            <span key={t.id} className={`text-xs font-bold px-2 py-0.5 rounded-full
              ${i === 0 ? 'bg-yellow-400 text-gray-900' : i === 1 ? 'bg-gray-300 text-gray-800' : i === 2 ? 'bg-orange-400 text-white' : 'bg-white/10 text-white/60'}`}>
              {medals[i]} {t.name} ({t.score})
            </span>
          ))}
        </div>
      </div>

      {/* TEAM SELECTION PROMPT (main screen only) */}
      {phase === 'main' && !rewardOpen && (
        <div className={`text-center py-2.5 rounded-2xl mb-3 text-sm font-black transition-all
          ${needTeamWarning
            ? 'bg-red-500 text-white'
            : selectedTeamId
              ? 'bg-white/15 text-white'
              : 'bg-white/10 text-white/70'
          }`}>
          {needTeamWarning
            ? '⚠️ Hãy chọn nhóm trả lời trước khi mở túi câu hỏi!'
            : selectedTeamId
              ? `✅ Nhóm trả lời: ${teams.find(t => t.id === selectedTeamId)?.name} — Bây giờ hãy chọn Túi Câu Hỏi`
              : '👆 Bước 1: Click vào thẻ nhóm để chọn nhóm trả lời'}
        </div>
      )}

      {/* STATUS BANNERS */}
      {rewardOpen && (
        <div className="glow-gold text-center py-2 rounded-2xl mb-3 font-black text-gray-900 text-sm"
          style={{ background: '#FFD700' }}>
          ⭐ {teams.find(t => t.id === winTeamId)?.name} trả lời ĐÚNG! Hãy chọn Túi Mù Phần Thưởng! ⭐
        </div>
      )}
      {doubleNext && (
        <div className="text-center py-2 rounded-2xl mb-3 font-black text-white text-sm"
          style={{ background: '#7c3aed' }}>
          🚀 Phần thưởng lượt này sẽ được NHÂN ĐÔI!
        </div>
      )}
      {stealNextId && (
        <div className="text-center py-2 rounded-2xl mb-3 font-black text-white text-sm"
          style={{ background: '#ea580c' }}>
          ⚡ {teams.find(t => t.id === stealNextId)?.name} sẽ cướp quyền trả lời câu hỏi tiếp theo!
        </div>
      )}

      {/* MAIN GAME AREA */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center mb-3">
            <div className="text-yellow-300 font-black text-lg">🎁 TÚI MÙ CÂU HỎI</div>
            <div className="text-white/50 text-xs">{usedQBags.size}/{NUM_Q} đã mở</div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: NUM_Q }, (_, i) => i + 1).map(id => (
              <QBag key={id} id={id} used={usedQBags.has(id)} onClick={openQBag} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center mb-3">
            <div className="text-yellow-300 font-black text-lg">🌟 TÚI MÙ PHẦN THƯỞNG</div>
            <div className="text-white/50 text-xs">{usedRBags.size}/{NUM_R} đã mở</div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: NUM_R }, (_, i) => i + 1).map(id => (
              <RBag key={id} id={id} used={usedRBags.has(id)} locked={!rewardOpen} onClick={openRBag} />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-white/30 text-xs mt-3 pb-2">
        Chọn nhóm → Mở Túi Câu Hỏi → Xác nhận đáp án → Mở Túi Phần Thưởng
      </div>

      {/* MODALS */}
      {phase === 'question' && curQ && (
        <QuestionModal q={curQ} teams={teams} ansTeamId={ansTeamId}
          setAnsTeamId={setAnsTeamId}
          wrongTeamIds={wrongTeamIds}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onClose={() => { setPhase('main'); setCurQ(null); setWrongTeamIds(new Set()) }} />
      )}

      {phase === 'result' && (
        <ResultModal correct={resultCorrect}
          teamName={teams.find(t => t.id === ansTeamId)?.name || ''}
          onDismiss={dismissResult} />
      )}

      {phase === 'reward_reveal' && curReward && !showTarget && (
        <RewardRevealModal reward={curReward} doubled={doubleNext}
          onApply={handleApplyReward}
          onClose={() => { setPhase('main'); setCurReward(null); setRewardOpen(false) }} />
      )}

      {showTarget && curReward && (
        <TargetModal teams={teams} excludeId={winTeamId} reward={curReward}
          onSelect={id => { setShowTarget(false); applyEffect(id) }}
          onClose={() => { setShowTarget(false); setPhase('main'); setCurReward(null); setRewardOpen(false) }} />
      )}

      {showManual && (
        <ManualModal teams={teams} onDelta={handleDelta} onClose={() => setShowManual(false)} />
      )}
    </div>
  )
}
