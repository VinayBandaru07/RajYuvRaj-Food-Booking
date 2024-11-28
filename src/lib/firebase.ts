import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDpHI8ITLqJ4NCllmRl8XjD3Cqmza2yeUM',
  authDomain: 'keepcallings.firebaseapp.com',
  databaseURL:
    'https://keepcallings-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'keepcallings',
  storageBucket: 'keepcallings.appspot.com',
  messagingSenderId: '286050839087',
  appId: '1:286050839087:web:5ffbb8020c6e20612e34da',
  measurementId: 'G-PMDNE4BJZF',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
