import axios from 'axios';
import { auth } from './firebase';

export async function getInstance() {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    auth.signOut().then(() => location.assign('/sign-in'));
  }

  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  instance.interceptors.response.use((response) => {
    if (response.status === 401) {
      auth.signOut().then(() => location.assign('/sign-in'));
    }

    return response;
  });

  return instance;
}
