import admin, { ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';

const config = JSON.parse(
  readFileSync('firebase.json').toString()
) as ServiceAccount;

export const app = admin.initializeApp({
  credential: admin.credential.cert(config),
});

export const auth = app.auth();
