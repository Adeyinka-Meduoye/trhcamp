import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Attendee, ExpectationPost, AdminUser } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApps()[0];

// Initialize Firestore with specific database ID if available
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Firestore Collections
const ATTENDEES_COLLECTION = 'attendees';
const EXPECTATIONS_COLLECTION = 'expectations';
const ADMIN_USERS_COLLECTION = 'admin_users';

// Helper to strip undefined values before passing to Firestore
export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  const cleanObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        cleanObj[key] = sanitizeForFirestore(val);
      } else {
        cleanObj[key] = val;
      }
    }
  });
  return cleanObj;
};

// --- ATTENDEES FIRESTORE HELPERS ---

export const subscribeAttendees = (callback: (attendees: Attendee[]) => void) => {
  const colRef = collection(db, ATTENDEES_COLLECTION);
  const q = query(colRef, orderBy('registeredAt', 'desc'));

  const processSnapshot = (snapshot: any) => {
    const list: Attendee[] = [];
    snapshot.forEach((docSnap: any) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Attendee);
    });
    callback(list);
  };

  return onSnapshot(
    q,
    processSnapshot,
    (err) => {
      console.warn('Firestore snapshot listener with order encountered issue, retrying basic collection:', err.message);
      // Fallback to simple collection snapshot without orderBy in case index or field sorting fails
      onSnapshot(colRef, processSnapshot, (fallbackErr) => {
        console.warn('Firestore basic collection snapshot offline/unavailable:', fallbackErr.message);
      });
    }
  );
};

export const saveAttendeeToFirestore = async (attendee: Attendee): Promise<Attendee> => {
  try {
    const docRef = doc(db, ATTENDEES_COLLECTION, attendee.id);
    const cleanedAttendee = sanitizeForFirestore(attendee);
    await setDoc(docRef, cleanedAttendee);
    return attendee;
  } catch (err) {
    console.error('Failed to save attendee to Firestore:', err);
    throw err;
  }
};

export const updateAttendeeInFirestore = async (attendee: Attendee): Promise<void> => {
  try {
    const docRef = doc(db, ATTENDEES_COLLECTION, attendee.id);
    const cleanedAttendee = sanitizeForFirestore(attendee);
    await setDoc(docRef, cleanedAttendee, { merge: true });
  } catch (err) {
    console.error('Failed to update attendee in Firestore:', err);
    throw err;
  }
};

export const deleteAttendeeFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, ATTENDEES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete attendee from Firestore:', err);
    throw err;
  }
};

// --- EXPECTATIONS FIRESTORE HELPERS ---

export const subscribeExpectations = (callback: (posts: ExpectationPost[]) => void) => {
  const colRef = collection(db, EXPECTATIONS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  const processSnapshot = (snapshot: any) => {
    const list: ExpectationPost[] = [];
    snapshot.forEach((docSnap: any) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ExpectationPost);
    });
    callback(list);
  };

  return onSnapshot(
    q,
    processSnapshot,
    (err) => {
      console.warn('Firestore expectations listener error, retrying basic collection:', err.message);
      onSnapshot(colRef, processSnapshot, (fallbackErr) => {
        console.warn('Firestore expectations collection offline/unavailable:', fallbackErr.message);
      });
    }
  );
};

export const saveExpectationToFirestore = async (post: ExpectationPost): Promise<void> => {
  try {
    const docRef = doc(db, EXPECTATIONS_COLLECTION, post.id);
    const cleanedPost = sanitizeForFirestore(post);
    await setDoc(docRef, cleanedPost);
  } catch (err) {
    console.error('Failed to save expectation post to Firestore:', err);
    throw err;
  }
};

export const incrementAmenInFirestore = async (postId: string, currentCount: number): Promise<void> => {
  try {
    const docRef = doc(db, EXPECTATIONS_COLLECTION, postId);
    await updateDoc(docRef, { amenCount: currentCount + 1 });
  } catch (err) {
    console.error('Failed to update amen count in Firestore:', err);
    throw err;
  }
};

export const deleteExpectationFromFirestore = async (postId: string): Promise<void> => {
  try {
    const docRef = doc(db, EXPECTATIONS_COLLECTION, postId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete expectation post from Firestore:', err);
    throw err;
  }
};

// --- GLOBAL WALL SETTINGS HELPERS ---
const SETTINGS_COLLECTION = 'settings';
const WALL_SETTINGS_DOC = 'wall_settings';

export interface WallSettings {
  maskAllNames: boolean;
  individuallyToggledIds: string[];
}

export const subscribeWallSettings = (callback: (settings: WallSettings) => void) => {
  const docRef = doc(db, SETTINGS_COLLECTION, WALL_SETTINGS_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          maskAllNames: Boolean(data.maskAllNames),
          individuallyToggledIds: Array.isArray(data.individuallyToggledIds) ? data.individuallyToggledIds : [],
        });
      } else {
        callback({ maskAllNames: false, individuallyToggledIds: [] });
      }
    },
    (err) => {
      console.warn('Firestore wall settings snapshot listener error:', err.message);
    }
  );
};

export const updateWallSettingsInFirestore = async (settings: Partial<WallSettings>): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, WALL_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error('Failed to update wall settings in Firestore:', err);
    throw err;
  }
};

// --- ADMIN USERS & RBAC FIRESTORE HELPERS ---

export const subscribeAdminUsers = (callback: (users: AdminUser[]) => void) => {
  const colRef = collection(db, ADMIN_USERS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'asc'));

  const processSnapshot = (snapshot: any) => {
    const list: AdminUser[] = [];
    snapshot.forEach((docSnap: any) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AdminUser);
    });
    callback(list);
  };

  return onSnapshot(
    q,
    processSnapshot,
    (err) => {
      console.warn('Firestore admin_users ordered listener encountered issue, retrying unordered:', err.message);
      onSnapshot(colRef, processSnapshot, (fallbackErr) => {
        console.warn('Firestore admin_users snapshot offline/unavailable:', fallbackErr.message);
      });
    }
  );
};

export const saveAdminUserToFirestore = async (user: AdminUser): Promise<AdminUser> => {
  try {
    const docRef = doc(db, ADMIN_USERS_COLLECTION, user.id);
    const cleanedUser = sanitizeForFirestore(user);
    await setDoc(docRef, cleanedUser);
    return user;
  } catch (err) {
    console.error('Failed to save admin user to Firestore:', err);
    throw err;
  }
};

export const updateAdminUserInFirestore = async (user: AdminUser): Promise<void> => {
  try {
    const docRef = doc(db, ADMIN_USERS_COLLECTION, user.id);
    const cleanedUser = sanitizeForFirestore(user);
    await setDoc(docRef, cleanedUser, { merge: true });
  } catch (err) {
    console.error('Failed to update admin user in Firestore:', err);
    throw err;
  }
};

export const deleteAdminUserFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, ADMIN_USERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete admin user from Firestore:', err);
    throw err;
  }
};

export const seedInitialAdminUsersIfEmpty = async (defaultUsers: AdminUser[]): Promise<void> => {
  try {
    const colRef = collection(db, ADMIN_USERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Seeding initial admin user accounts to Firestore...');
      for (const user of defaultUsers) {
        const docRef = doc(db, ADMIN_USERS_COLLECTION, user.id);
        await setDoc(docRef, sanitizeForFirestore(user));
      }
      console.log(`Seeded ${defaultUsers.length} initial admin users.`);
    }
  } catch (err) {
    console.warn('Could not seed initial admin users (offline or permissions):', err);
  }
};

