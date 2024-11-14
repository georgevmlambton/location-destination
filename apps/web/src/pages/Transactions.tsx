import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowLeft from '../assets/arrow-left.svg';
import { NavButton } from '../components/nav/NavButton';
import { getInstance } from '../axios';
import { TransactionsResponse } from '@location-destination/types/src/requests/transaction';

export function Transactions() {
  const navigate = useNavigate();
  const [transactionsResponse, setTransactionsResponse] =
    useState<TransactionsResponse | null>(null);

  const transactions = useMemo(() => {
    const currentYear = new Date().getFullYear();

    if (!transactionsResponse) {
      return [];
    }

    return transactionsResponse.transactions.reduce(
      (acc, transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        const year = transactionDate.getFullYear();
        const day = transactionDate.getDate();
        const month = transactionDate.toLocaleString('default', {
          month: 'short',
        });

        const formattedDate =
          year === currentYear ? `${day} ${month}` : `${day} ${month}, ${year}`;

        if (!acc[formattedDate]) {
          acc[formattedDate] = [];
        }

        acc[formattedDate].push(transaction);

        return acc;
      },
      {} as Record<string, TransactionsResponse['transactions']>
    );
  }, [transactionsResponse]);

  useEffect(() => {
    getInstance().then(async (axios) => {
      const response = await axios.get<TransactionsResponse>(
        '/api/account/transactions'
      );
      setTransactionsResponse(response.data);
    });
  }, []);

  return (
    <div className="d-flex flex-column align-items-stretch position-relative p-4 h-100 w-100">
      <div className="pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={() => navigate('/trips')} />
      </div>

      <h1 className="display-6 mt-5 mb-3">
        <b>Transaction History</b>
      </h1>

      {Object.entries(transactions).map(([date, transactions]) => (
        <>
          <h4 className="text-secondary mt-4">{date}</h4>
          {transactions.map((transaction) => (
            <div className="d-flex fs-5 mb-3 border border-dark-subtle p-3 rounded">
              <p>
                {transaction.ride
                  ? `Ride to ${transaction.ride.dropoffAddress}`
                  : ''}
              </p>
              <p
                className={
                  'flex-grow-1 text-end' +
                  (transaction.type === 'debit'
                    ? ' text-danger'
                    : ' text-success')
                }
              >
                {transaction.type === 'debit' ? '-' : ''}$
                {Math.abs(transaction.amount / 100)}
              </p>
            </div>
          ))}
        </>
      ))}
    </div>
  );
}
