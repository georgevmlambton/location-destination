import axios from 'axios';
import { auth } from './firebase';

export async function getInstance() {
  const token = await auth.currentUser?.getIdToken();

  return axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
}
