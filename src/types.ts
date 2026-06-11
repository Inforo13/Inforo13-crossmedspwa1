export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string; // HH:mm (Primary or first dose)
  times?: string[]; // Multiple doses per day
  startDate: string;
  endDate?: string;
  instructions?: string;
  active: boolean;
  lastTaken?: string; // ISO date string
  createdAt: string;
  type?: string; // Comprimido, Xarope, etc.
  route?: string; // Oral, Tópica, etc.
  stock?: number;
  initialStock?: number;
  refillThreshold?: number;
  color?: string;
  shape?: string;
  indication?: string; // ex: Dor de cabeça
  howToTake?: string;  // ex: Em jejum
  purchaseDate?: string;
  expiryDate?: string;
  purchaseLocation?: string;
  durationDays?: number;
  doseHistory?: Record<string, 'taken' | 'skipped'>;
  isCompounded?: boolean;
  components?: Array<{ name: string; dosage: string }>;
}

export interface HealthLog {
  id: string;
  userId: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  symptoms: string[];
  notes?: string;
  createdAt: string;
}

export interface MedicationInteraction {
  medicationIds: string[];
  medicationNames: string[];
  severity: 'high' | 'moderate' | 'low';
  description: string;
  recommendation: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}
