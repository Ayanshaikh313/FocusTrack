// src/services/firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { AppUsageStat } from '../../modules/usage-stats';

export { auth, firestore };

export const Collections = {
  USERS: 'users',
  USAGE_LOGS: 'usageLogs',
  GOALS: 'goals',
} as const;

export async function logUsageToFirestore(stats: AppUsageStat[]) {
  const user = auth().currentUser;

  if (!user) {
    return;
  }

  await firestore()
    .collection(Collections.USERS)
    .doc(user.uid)
    .collection(Collections.USAGE_LOGS)
    .add({
      createdAt: firestore.FieldValue.serverTimestamp(),
      stats,
    });
}
