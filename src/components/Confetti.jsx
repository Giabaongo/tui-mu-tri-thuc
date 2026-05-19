export default function Confetti({ on }) {
  if (!on) return null
  const pieces = Array.from({length:60},(_,i) => ({
    id:i, left:Math.random()*100,
    color:['#FFD700','#CC0000','#FFFFFF','#FF6B6B','#4ECDC4','#A78BFA'][i%6],
    dur:1.8+Math.random()*2, delay:Math.random()*0.8,
    size:6+Math.random()*10, round:Math.random()>0.5,
  }))
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999}}>
      {pieces.map(p=>(
        <div key={p.id} className="confetti-p" style={{
          left:`${p.left}%`, top:'-20px',
          width:`${p.size}px`, height:`${p.size}px`,
          backgroundColor:p.color, borderRadius:p.round?'50%':'2px',
          animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
        }}/>
      ))}
    </div>
  )
}
