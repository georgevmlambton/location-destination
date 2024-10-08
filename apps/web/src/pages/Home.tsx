import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../providers/user-provider';
import { getInstance } from '../axios';

export default function Home() {
  const { signOut } = useContext(UserContext);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getInstance()
      .then(async (axios) => {
        const response = await axios.get<string>('/');
        setMessage(response.data);
      })
      .catch((e) => {
        console.error(e.message);
      });
  }, []);

  return (
    <div>
      <p>{message}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
