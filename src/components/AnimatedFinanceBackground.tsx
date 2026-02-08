import './AnimatedFinanceBackground.css';

export default function AnimatedFinanceBackground() {
  // SVG animado sutil, fondo degradado
  return (
    <div className="animated-background">
      <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="0.4" stopColor="#f59e0b" />
            <stop offset="0.7" stopColor="#10b981" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#bg-gradient)" opacity="0.08" />
        <g>
          <polyline points="0,800 200,700 400,750 600,600 800,650 1000,500 1200,600 1440,400" stroke="#3b82f6" strokeWidth="16" fill="none">
            <animate attributeName="points" values="0,800 200,700 400,750 600,600 800,650 1000,500 1200,600 1440,400;0,820 200,720 400,770 600,620 800,670 1000,520 1200,620 1440,420;0,800 200,700 400,750 600,600 800,650 1000,500 1200,600 1440,400" dur="12s" repeatCount="indefinite" />
          </polyline>
          <polyline points="0,600 200,500 400,550 600,400 800,450 1000,300 1200,400 1440,200" stroke="#10b981" strokeWidth="14" fill="none">
            <animate attributeName="points" values="0,600 200,500 400,550 600,400 800,450 1000,300 1200,400 1440,200;0,620 200,520 400,570 600,420 800,470 1000,320 1200,420 1440,220;0,600 200,500 400,550 600,400 800,450 1000,300 1200,400 1440,200" dur="16s" repeatCount="indefinite" />
          </polyline>
          <polyline points="0,700 200,600 400,650 600,500 800,550 1000,400 1200,500 1440,300" stroke="#f59e0b" strokeWidth="12" fill="none">
            <animate attributeName="points" values="0,700 200,600 400,650 600,500 800,550 1000,400 1200,500 1440,300;0,720 200,620 400,670 600,520 800,570 1000,420 1200,520 1440,320;0,700 200,600 400,650 600,500 800,550 1000,400 1200,500 1440,300" dur="14s" repeatCount="indefinite" />
          </polyline>
          <polyline points="0,900 200,800 400,850 600,700 800,750 1000,600 1200,700 1440,500" stroke="#a78bfa" strokeWidth="10" fill="none">
            <animate attributeName="points" values="0,900 200,800 400,850 600,700 800,750 1000,600 1200,700 1440,500;0,920 200,820 400,870 600,720 800,770 1000,620 1200,720 1440,520;0,900 200,800 400,850 600,700 800,750 1000,600 1200,700 1440,500" dur="18s" repeatCount="indefinite" />
          </polyline>
        </g>
      </svg>
    </div>
  );
}
