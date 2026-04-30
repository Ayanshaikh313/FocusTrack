// src/store/authStore.ts
import { create } from 'zustand';
import { auth, firestore, Collections } from '../services/firebase';

interface User {
  uid: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,

  signIn: async (email, password) => {
    set({ loading: true });
    await auth().signInWithEmailAndPassword(email, password);
    set({ loading: false });
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    const { user } = await auth().createUserWithEmailAndPassword(email, password);
    await firestore().collection(Collections.USERS).doc(user.uid).set({
      name,
      email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      plan: 'free',
    });
    set({ user: { uid: user.uid, email, name }, loading: false });
  },

  signOut: async () => {
    await auth().signOut();
    set({ user: null });
  },
}));