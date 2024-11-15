import { useContext, useEffect, useMemo, useState } from 'react';
import hourglass from '../../assets/hourglass-split.svg';
import cartCheck from '../../assets/cart-check-fill.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInstance } from '../../axios';
import { ToastContext } from '../../providers/toast-provider';
import { TransactionResponse } from '@location-destination/types/src/requests/transaction';

export function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();

  const transactionId = useMemo(
    () => new URLSearchParams(location.search).get('transactionId'),
    [location]
  );

  useEffect(() => {
    if (!transactionId) {
      navigate('/trips');
    }

    getInstance().then(async (axios) => {
      try {
        const response = await axios.get<TransactionResponse>(
          '/api/account/transactions/' + transactionId
        );

        if (response.data.paymentStatus !== 'Paid') {
          navigate('/payment/failed');
          return;
        }

        setLoading(false);
      } catch (e) {
        toast.show(e.message, 'danger');
        navigate('/trips');
      }
    });
  }, [navigate, toast, transactionId]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {loading && (
        <div className="text-center px-4">
          <img
            src={hourglass}
            alt="Waiting Icon"
            className="mb-4"
            style={{ width: '100px', height: '100px' }}
          />
          <h1 className="display-4 mb-5">Verifying your payment</h1>
          <p className="lead">Please wait...</p>
        </div>
      )}
      {!loading && (
        <div className="text-center px-4">
          <img
            src={cartCheck}
            alt="Waiting Icon"
            className="mb-4"
            style={{ width: '100px', height: '100px' }}
          />
          <h1 className="display-4 mb-5">Payment successful!</h1>

          <button
            className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
            style={{ backgroundColor: '#00634B', border: 'none' }}
            onClick={() => navigate('/trips')}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
