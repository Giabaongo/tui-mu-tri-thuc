export default function ResultModal({ correct, teamName, onDismiss }) {
  return (
    <div className="modal-bg" onClick={onDismiss}>
      <div className={`text-center p-8 rounded-3xl shadow-2xl slide-up ${correct?'bg-green-500':'bg-red-600'}`} style={{maxWidth:380}}>
        <div style={{fontSize:64}}>{correct?'🎉':'😢'}</div>
        <div className="text-white font-black text-4xl mt-2">{correct?'ĐÚNG RỒI!':'SAI RỒI!'}</div>
        <div className="text-white/90 text-lg mt-1 font-semibold">{teamName}</div>
        <div className="text-white/80 text-sm mt-2">
          {correct?'+2 điểm · Được mở Túi Mù Phần Thưởng!':'-1 điểm · Mất quyền mở thưởng'}
        </div>
        <div className="mt-5 text-white/50 text-xs">Nhấn bất kỳ đâu để tiếp tục</div>
      </div>
    </div>
  )
}
