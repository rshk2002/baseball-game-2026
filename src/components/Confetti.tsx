"use client";

import { useState } from "react";

type Piece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
};

const COLORS = ["#ffb020", "#34d399", "#60a5fa", "#f472b6", "#e8eef7"];

/** 승리 시 축하 컨페티 (외부 라이브러리 없이 CSS 애니메이션) */
export default function Confetti() {
  // 승리 후 클라이언트에서만 마운트되므로 SSR 불일치 없음
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: 80 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 1.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: Math.random() * 360,
    }))
  );

  return (
    <div aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
