import { useContext } from 'react';
import personFill from '../assets/person-fill.svg';
import background from '../assets/background.png';
import { UserContext } from '../providers/user-provider';
import { NavButton } from '../components/nav/NavButton';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { profile } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div
      className="w-100 h-100 d-flex flex-column align-items-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(189,229,199,1) 0%, rgba(248,248,248,1) 30%, rgba(255,255,255,1) 100%)',
      }}
    >
      <img
        className="position-absolute"
        src={background}
        style={{
          height: 'auto',
          bottom: '-38%',
          left: '-49%',
          opacity: '24%',
          width: '160%',
        }}
      />
      <div className="p-4 align-self-stretch">
        <div className="d-flex justify-content-between position-relative">
        <img
            className="rounded-circle"
            src={profile?.photoUrl || personFill}
            alt="Profile Avatar"
            style={{
              width: '50px',
              height: '50px',
              border: '2px solid #CCCCCC',
              background: 'white',
              cursor: 'pointer',
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      <h3 className="text-dark-emphasis">Welcome, {profile?.name}</h3>
    </div>
  );
}
