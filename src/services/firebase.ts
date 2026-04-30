// src/services/firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export { auth, firestore };

export const Collections = {
  USERS: 'users',
  USAGE_LOGS: 'usageLogs',
  GOALS: 'goals',
} as const;