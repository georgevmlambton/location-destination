import x from '../../assets/x.svg';
import { useNavigate } from 'react-router-dom';

export function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center px-4">
        <img
          src={x}
          alt="Waiting Icon"
          className="mb-4"
          style={{ width: '100px', height: '100px' }}
        />
        <h1 className="display-4 mb-5">Payment Failed</h1>
        <p className="lead">Please try again after some time</p>

        <button
          className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
          style={{ backgroundColor: '#00634B', border: 'none' }}
          onClick={() => navigate('/trips')}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
