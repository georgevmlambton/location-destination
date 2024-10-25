import { Outlet } from 'react-router-dom';
import background from '../assets/background.png';

export function MainLayout() {
  return (
    <div
      className="w-100 h-100"
      style={{
        background:
          'linear-gradient(180deg, rgba(189,229,199,1) 0%, rgba(248,248,248,1) 30%, rgba(255,255,255,1) 100%)',
      }}
    >
      <img
        className="position-fixed"
        src={background}
        style={{
          height: 'auto',
          bottom: '-38%',
          left: '-49%',
          opacity: '24%',
          width: '160%',
        }}
      />

      <Outlet />
    </div>
  );
}
