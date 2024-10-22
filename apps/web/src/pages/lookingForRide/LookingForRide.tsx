import arrowLeft from '../../assets/arrow-left.svg';
import background from '../../assets/background.png';
import { NavButton } from '../../components/nav/NavButton';
import { useNavigate } from 'react-router-dom';

export function LookingForRide() {
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

      <div className="p-4 pb-5 position-relative overflow-hidden w-100">
        {/* Make sure the container uses full width and aligns the button to the left */}
        <div className="d-flex position-relative" style={{ width: '100%' }}>
          <NavButton
            icon={arrowLeft}
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      <div className="p-4 align-self-stretch">
        <div className="d-flex justify-content-between position-relative">
        
        </div>
      </div>

      <h3 className="text-dark-emphasis">Where Are We Travelling Today?</h3>
    </div>
  );
}
