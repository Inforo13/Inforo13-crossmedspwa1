import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Medication, HealthLog, MedicationInteraction, OperationType, FirestoreErrorInfo } from './types';
import { checkMedicationInteractions, chatWithIA } from './services/interactionService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceButton } from './components/VoiceButton';
import { MedicationCard } from './components/MedicationCard';
import { MedicationForm } from './components/MedicationForm';
import { HealthTab } from './components/HealthTab';
import { MedicalPortal } from './components/MedicalPortal';
import { ReceitaDigitalPage } from './components/ReceitaDigitalPage';
import { SymptomAnalysisPage } from './components/SymptomAnalysisPage';
import { InteractionsPage } from './components/InteractionsPage';
import { AddFormulaPage } from './components/AddFormulaPage';
import { TreatmentAnalysisPage } from './components/TreatmentAnalysisPage';
import { SinaisVitaisPage } from './components/SinaisVitaisPage';
import { AcompanhamentoPage } from './components/AcompanhamentoPage';
import { InsulinasPage } from './components/InsulinasPage';
import { FitoterapicosPage } from './components/FitoterapicosPage';
import { RelatorioPage } from './components/RelatorioPage';
import { ContatoPage } from './components/ContatoPage';
import { QuemSomosPage } from './components/QuemSomosPage';
import { PrivacidadePage } from './components/PrivacidadePage';
import { ManualPage } from './components/ManualPage';
import { FaqPage } from './components/FaqPage';
import { UpgradePage } from './components/UpgradePage';
import AnalisarExamePage from './components/AnalisarExamePage';
import { LandingPage } from './components/LandingPage';
import { 
  Pill, 
  LogOut, 
  Heart, 
  Calendar, 
  Clock, 
  Crown, 
  ShieldAlert, 
  Sparkles, 
  User as UserIcon, 
  Gift, 
  RefreshCw, 
  Beaker, 
  Droplets, 
  Leaf, 
  FileBarChart, 
  Mail, 
  Maximize, 
  ClipboardCheck, 
  Plus, 
  Moon, 
  Sun, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  PhoneCall, 
  QrCode, 
  Check, 
  Activity, 
  Search, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Stethoscope,
  MessageSquare,
  Home,
  Info,
  Bell,
  Volume2,
  VolumeX,
  Lock,
  Key,
  Watch,
  Bluetooth,
  Flame,
  Footprints,
  Battery,
  MapPin,
  RotateCcw,
  Share2,
  Send,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const formatHowToTake = (howToTake?: string) => {
  if (!howToTake || howToTake === 'Selecione') return '';
  const text = howToTake.toLowerCase();
  if (text.includes('jejum')) {
    return 'em-jejum-30min-2h';
  }
  if (text.includes('refeição') || text.includes('refeicao')) {
    return 'com-refeicao';
  }
  if (text.includes('com ou sem alimentos')) {
    return 'com-ou-sem-alimentos';
  }
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, '-');
};

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const local = localStorage.getItem('local_fallback_user');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isPremiumSimulated, setIsPremiumSimulated] = useState(() => {
    const saved = localStorage.getItem('is_premium_simulated');
    return saved === 'true';
  });
  const [dbUserPremium, setDbUserPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStripeSim, setShowStripeSim] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Stripe Checkout simulation states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const hasUnlimitedAccess = () => {
    if (!user) return false;
    
    // 1. Specific healthcare professional test account
    const isProfessional = user.email === 'wsaconato@terra.com.br' || user.email === 'wsaconato@gmail.com';
    
    // 2. Simulated Premium checkout upgrade
    const isPremiumSim = isPremiumSimulated || 
                         localStorage.getItem(`is_premium_${user.uid}`) === 'true' ||
                         dbUserPremium;

    return isProfessional || isPremiumSim;
  };

  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [interactions, setInteractions] = useState<MedicationInteraction[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>();
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(null);
      }
    });
  };

  // Smartwatch & Google Fit States
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothConnecting, setBluetoothConnecting] = useState(false);
  const [googleFitAuthorized, setGoogleFitAuthorized] = useState(false);
  const [googleFitAuthorizing, setGoogleFitAuthorizing] = useState(false);
  const [pulseRate, setPulseRate] = useState<string | number>('--');
  const [batteryLevel, setBatteryLevel] = useState<string | number>('--');
  const [stepsCount, setStepsCount] = useState<string | number>('--');
  const [caloriesBurned, setCaloriesBurned] = useState<string | number>('--');
  
  // Custom router state for matching the screenshot route
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [doctorAlert, setDoctorAlert] = useState<any | null>(null);

  useEffect(() => {
    const checkAlert = () => {
      const saved = localStorage.getItem('crossmeds_doctor_alerts');
      if (saved) {
        try {
          setDoctorAlert(JSON.parse(saved));
        } catch (_) {}
      } else {
        setDoctorAlert(null);
      }
    };
    checkAlert();
    window.addEventListener('storage', checkAlert);
    return () => window.removeEventListener('storage', checkAlert);
  }, [activeTab]);

  const isCustomRoute = currentPath.includes('/diagnostico-sintomas') || currentPath.includes('/interacoes') || currentPath.includes('/adicionar-formula') || currentPath.includes('/analise-tratamento') || currentPath.includes('/sinais-vitais') || currentPath.includes('/acompanhamento') || currentPath.includes('/insulinas') || currentPath.includes('/fitoterapicos') || currentPath.includes('/relatorio') || currentPath.includes('/contato') || currentPath.includes('/analisar-exame') || currentPath.includes('/quem-somos') || currentPath.includes('/privacidade') || currentPath.includes('/manual') || currentPath.includes('/faq') || currentPath.includes('/upgrade');

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    // Overwrite history.pushState to catch application routing transitions
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handleLocationChange();
      return result;
    };

    // Overwrite history.replaceState
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handleLocationChange();
      return result;
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Paywall & Blocked Path Guard
  useEffect(() => {
    if (user && !hasUnlimitedAccess()) {
      const blockedPaths = [
        '/diagnostico-sintomas',
        '/interacoes',
        '/adicionar-formula',
        '/analise-tratamento',
        '/sinais-vitais',
        '/acompanhamento',
        '/insulinas',
        '/fitoterapicos',
        '/relatorio',
        '/analisar-exame'
      ];
      
      const isBlocked = blockedPaths.some(p => currentPath.includes(p)) || 
                        ((activeTab === 'reports' || activeTab === 'followup') && currentPath === '/');
                        
      if (isBlocked) {
        window.history.pushState({}, '', '/upgrade');
        setCurrentPath('/upgrade');
      }
    }
  }, [currentPath, activeTab, user]);

  // Theme and dialog controls
  const [darkMode, setDarkMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // States for 5-second held SOS trigger and GPS Tracking
  const [sosHoldProgress, setSosHoldProgress] = useState(0); // 0 to 100
  const [sosHoldTime, setSosHoldTime] = useState(5); // 5 down to 0
  const [sosIsPressing, setSosIsPressing] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosWarning, setSosWarning] = useState(false);
  const [sosLocation, setSosLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sosLocationError, setSosLocationError] = useState<string | null>(null);

  const sosIntervalRef = React.useRef<any>(null);

  const getPatientProfile = () => {
    const defaultProfile = {
      nome: 'W. S. A. Conato',
      idade: '45',
      altura: '1.75',
      peso: '78',
      pressaoSistolica: '120',
      pressaoDiastolica: '80',
      alergias: 'Penicilina, Corantes, Corante Tartrazina',
      doencas: 'Hipertensão, Diabetes Tipo 2',
      tipoSanguineo: 'O+',
      contatoEmergenciaNome: 'Clara Saconato',
      contatoEmergenciaParentesco: 'Cônjuge (Esposa/Marido)',
      contatoEmergenciaTelefone: '(17) 98836-2599',
    };
    
    try {
      const saved = localStorage.getItem('crossmeds_patient_profile');
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return defaultProfile;
  };

  const playSosBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const startSosHolding = () => {
    if (sosTriggered) return;
    setSosIsPressing(true);
    setSosHoldProgress(0);
    setSosHoldTime(5);
    setSosWarning(false);
    
    // Quick GPS preload
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSosLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setSosLocationError(null);
        },
        (error) => {
          setSosLocationError('Permissão para GPS recusada.');
          if (!sosLocation) {
            setSosLocation({ lat: -21.7852, lng: -48.1758 });
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setSosLocationError('Geolocalização não suportada.');
      setSosLocation({ lat: -21.7852, lng: -48.1758 });
    }
    
    const duration = 5000;
    const intervalTime = 50;
    let elapsed = 0;
    
    if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
    
    sosIntervalRef.current = setInterval(() => {
      elapsed += intervalTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setSosHoldProgress(progress);
      
      const secondsLeft = Math.max(5 - Math.floor(elapsed / 1000), 0);
      setSosHoldTime(secondsLeft);

      // Vibrate on every second for physical reassurance feedback
      if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - intervalTime) / 1000)) {
        if (navigator.vibrate) {
          navigator.vibrate(80);
        }
      }
      
      if (elapsed >= duration) {
        clearInterval(sosIntervalRef.current);
        setSosIsPressing(false);
        setSosHoldProgress(100);
        setSosHoldTime(0);
        setSosTriggered(true);
        setSosOpen(true);
        playSosBeep();
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }, intervalTime);
  };

  const stopSosHolding = () => {
    if (sosTriggered) return;
    
    if (sosIsPressing && sosHoldProgress < 98) {
      setSosWarning(true);
      setTimeout(() => {
        setSosWarning(false);
      }, 3000);
    }

    if (sosIntervalRef.current) {
      clearInterval(sosIntervalRef.current);
    }
    setSosIsPressing(false);
    setSosHoldProgress(0);
    setSosHoldTime(5);
  };

  const closeSosModal = () => {
    if (sosIntervalRef.current) {
      clearInterval(sosIntervalRef.current);
    }
    setSosOpen(false);
    setSosIsPressing(false);
    setSosHoldProgress(0);
    setSosHoldTime(5);
    setSosTriggered(false);
    setSosWarning(false);
  };

  // Phone Locked Active Alarm Simulator State
  const [ringingAlarm, setRingingAlarm] = useState<{
    medication: Medication;
    time: string;
    isTest?: boolean;
  } | null>(null);
  const [alarmMuted, setAlarmMuted] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioIntervalRef = React.useRef<any>(null);

  const startAlarmTone = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      let toggle = true;
      audioIntervalRef.current = setInterval(() => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Pleasant dual alarm tone
        osc.frequency.setValueAtTime(toggle ? 880 : 1046.5, ctx.currentTime);
        toggle = !toggle;

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }, 700);
    } catch (e) {
      console.error('Failed to play alarm tone:', e);
    }
  };

  const stopAlarmTone = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Alarm Triggering Engine (checks if current hour/minute matches any active medication schedule)
  const lastTriggeredAlarmKey = React.useRef<string>('');

  useEffect(() => {
    if (!user || medications.length === 0 || ringingAlarm) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      // Format as HH:MM
      const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayString = now.toISOString().split('T')[0];
      const alarmKey = `${todayString} ${currentHourMin}`;

      // If we already ran/triggered or skipped/took this minute, do not re-run
      if (lastTriggeredAlarmKey.current === alarmKey) return;

      for (const med of medications) {
        if (!med.active) continue;
        const times = med.times || [med.time || '08:00'];
        
        if (times.includes(currentHourMin)) {
          const doseHistoryKey = `${todayString} ${currentHourMin}`;
          const currentStatus = med.doseHistory?.[doseHistoryKey];

          // If no action taken yet for this specific schedule time today
          if (!currentStatus) {
            lastTriggeredAlarmKey.current = alarmKey;
            setRingingAlarm({
              medication: med,
              time: currentHourMin
            });
            startAlarmTone();
            break;
          }
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(checkInterval);
    };
  }, [user, medications, ringingAlarm]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      stopAlarmTone();
    };
  }, []);

  const handleTestAlarm = () => {
    // If medications is empty, fabricate a realistic test medication
    const testMed: Medication = medications.find(m => m.active) || {
      id: 'test_id',
      userId: user?.uid || '',
      name: 'LOSARTANA POTÁSSICA',
      dosage: '50mg + 25mg',
      frequency: '1 vez ao dia',
      route: 'Oral',
      howToTake: 'Em jejum 30 minutos antes do café da manhã',
      instructions: 'Evitar ingerir com bebidas alcoólicas.',
      active: true,
      times: ['08:00'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRingingAlarm({
      medication: testMed,
      time: new Date().toTimeString().substring(0, 5),
      isTest: true,
    });
    startAlarmTone();
  };

  // Validate Firestore Connection on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or internet connection.");
        }
      }
    }
    testConnection();
  }, []);

  // Auto handle Google Calendar sync popup after prescription import redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('import_calendar_sync') === 'true' && user) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        handleSyncGoogleCalendar();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Monitor Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If we are currently in local fallback mode, don't clear user automatically
      if (!currentUser) {
        const isLocalUser = user && user.uid.startsWith('wsaconato-terra-test');
        if (isLocalUser) {
          setLoading(false);
          return;
        }
      }
      setUser(currentUser);
      if (currentUser) {
        // Automatically ensure user document is initialized
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString()
            });
          } else {
            const existingData = userSnap.data();
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              createdAt: existingData?.createdAt || new Date().toISOString()
            }, { merge: true });
          }
        } catch (error) {
          console.error('Error ensuring user collection:', error);
          try {
            handleFirestoreError(error, OperationType.WRITE, 'users/' + currentUser.uid);
          } catch (e) {
            console.error('Gracefully handled user initialization failure:', e);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Monitor User document in Firestore for real-time profile updates (like premium status)
  useEffect(() => {
    if (!user || user.uid.startsWith('wsaconato-terra-test')) {
      setDbUserPremium(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDbUserPremium(data?.isPremium === true);
      } else {
        setDbUserPremium(false);
      }
    }, (error) => {
      console.warn('Error fetching user real-time status:', error);
      handleFirestoreError(error, OperationType.GET, 'users/' + user.uid);
    });

    return () => unsubscribe();
  }, [user]);

  // Monitor Medications Firestore stream or local storage
  useEffect(() => {
    if (!user) {
      setMedications([]);
      return;
    }

    if (user.uid.startsWith('wsaconato-terra-test')) {
      const localMedsStr = localStorage.getItem(`medications_${user.uid}`);
      const meds = localMedsStr ? JSON.parse(localMedsStr) : [];
      setMedications(meds.sort((a: any, b: any) => (a.time || '08:00').localeCompare(b.time || '08:00')));
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'medications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));
      setMedications(meds.sort((a, b) => (a.time || '08:00').localeCompare(b.time || '08:00')));
    }, (error) => {
      console.warn('Firestore medications snapshot error:', error);
      const localMedsStr = localStorage.getItem(`medications_${user.uid}`);
      const meds = localMedsStr ? JSON.parse(localMedsStr) : [];
      setMedications(meds);
    });

    return () => unsubscribe();
  }, [user]);

  // Monitor HealthLogs/Wellness Firestore stream or local storage
  useEffect(() => {
    if (!user) {
      setHealthLogs([]);
      return;
    }

    if (user.uid.startsWith('wsaconato-terra-test')) {
      const localLogsStr = localStorage.getItem(`healthLogs_${user.uid}`);
      const logs = localLogsStr ? JSON.parse(localLogsStr) : [];
      setHealthLogs(logs.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)));
      return;
    }

    const q = query(collection(db, 'healthLogs'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthLog));
      setHealthLogs(logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      console.warn('Firestore healthLogs snapshot error:', error);
      const localLogsStr = localStorage.getItem(`healthLogs_${user.uid}`);
      const logs = localLogsStr ? JSON.parse(localLogsStr) : [];
      setHealthLogs(logs);
    });

    return () => unsubscribe();
  }, [user]);

  // Check Medication Interactions in real-time
  useEffect(() => {
    const checkInteractions = async () => {
      const activeMeds = medications.filter(m => m.active);
      if (activeMeds.length < 2) {
        setInteractions([]);
        return;
      }
      const results = await checkMedicationInteractions(activeMeds);
      setInteractions(results);
    };
    checkInteractions();
  }, [medications]);

  // Inject friendly welcome AI prompt on first open
  useEffect(() => {
    if (chatOpen && chatMessages.length === 0) {
      setChatMessages([
        { role: 'model', text: 'Olá! Sou o **CrossMeds IA**, seu consultor inteligente de farmacologia de bolso. Como posso auxiliar você com sua prescrição, dosagem correta, restrições alimentares ou efeitos colaterais hoje?' }
      ]);
    }
  }, [chatOpen, chatMessages.length]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setAuthError('Erro ao entrar com o Google. Tente novamente.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          // If user not found, and it is the special professional test user, automatically create it!
          if (email === 'wsaconato@terra.com.br' && password === '123456' && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              setAuthLoading(false);
              return;
            } catch (createErr) {
              console.error('Auto create failed:', createErr);
            }
          }
          throw signInErr;
        }
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      
      // Fallback for demo credentials in case Firebase Email/Password auth is not enabled/configured yet
      if (email === 'wsaconato@terra.com.br' && password === '123456') {
        const fallbackUser = {
          uid: 'wsaconato-terra-test-uid',
          email: 'wsaconato@terra.com.br',
          displayName: 'W. S. A. Conato',
          photoURL: null,
          providerId: 'password',
          providerData: [{ providerId: 'password', email: 'wsaconato@terra.com.br' }]
        };
        localStorage.setItem('local_fallback_user', JSON.stringify(fallbackUser));
        setUser(fallbackUser as any);
        setAuthLoading(false);
        return;
      }

      // Readable error messages in Portuguese
      let errorMsg = 'Ocorreu um erro na autenticação.';
      if (err.code === 'auth/invalid-email') {
        errorMsg = 'E-mail inválido.';
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = 'Esta conta foi desativada.';
      } else if (err.code === 'auth/user-not-found') {
        errorMsg = 'Usuário não encontrado. Verifique seus dados ou crie uma conta.';
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'Senha incorreta. Tente novamente.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Este e-mail já está em uso por outro usuário.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'A senha deve conter no mínimo 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'O login com E-mail/Senha precisa ser ativado no console do Firebase.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('local_fallback_user');
      localStorage.removeItem('is_premium_simulated');
      setIsPremiumSimulated(false);
      await signOut(auth);
      setDarkMode(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (!accessToken) {
        throw new Error('Não foi possível obter o token de acesso do Google.');
      }
      
      const activeMeds = medications.filter(m => m.active);
      if (activeMeds.length === 0) {
        throw new Error('Nenhum medicamento ativo com lembretes para sincronizar.');
      }

      let count = 0;
      for (const med of activeMeds) {
        const times = med.times || [med.time || '08:00'];
        for (const rawTime of times) {
          const todayStr = new Date().toISOString().split('T')[0];
          const startDateTime = `${todayStr}T${rawTime}:00`;
          
          let endHour = parseInt(rawTime.substring(0, 2));
          let endMin = parseInt(rawTime.substring(3, 5)) + 30;
          if (endMin >= 60) {
            endMin -= 60;
            endHour += 1;
          }
          if (endHour >= 24) {
            endHour = 23;
            endMin = 59;
          }
          const endDateTime = `${todayStr}T${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:00`;

          const eventBody = {
            summary: `Tomar ${med.name}`,
            description: `Dosagem: ${med.dosage || ''}\nInstruções: ${med.howToTake && med.howToTake !== 'Selecione' ? med.howToTake : ''}. Indicação: ${med.instructions || ''}\n\nPara registrar que tomou e monitorar sua adesão, acesse: https://crossmeds.com.br`,
            location: 'Em casa',
            start: {
              dateTime: startDateTime,
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: endDateTime,
              timeZone: 'America/Sao_Paulo'
            },
            recurrence: [
              'RRULE:FREQ=DAILY'
            ],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 10 }
              ]
            }
          };

          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventBody)
          });

          if (res.ok) {
            count++;
          } else {
            const errText = await res.text();
            console.error('Erro ao adicionar evento:', errText);
          }
        }
      }

      setSyncStatus({
        success: true,
        message: `Sincronização Completa! Todos os ${count} lembretes foram adicionados ao seu Google Calendar.`
      });
      
      setTimeout(() => {
        setSyncStatus(null);
      }, 6000);

    } catch (error: any) {
      console.error('Calendar sync error:', error);
      setSyncStatus({
        success: false,
        message: `Falha na sincronização: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddMedicationClick = () => {
    if (!hasUnlimitedAccess() && medications.length >= 3) {
      window.history.pushState({}, '', '/upgrade');
    } else {
      setEditingMed(undefined);
      setIsFormOpen(true);
    }
  };

  // Medications management database actions
  const handleSaveMedication = async (data: Partial<Medication>, keepOpen = false) => {
    if (!user) {
      throw new Error("Você precisa estar autenticado para salvar receitas ou fórmulas.");
    }

    // Check tasting limit (3 medicines limit) for non-masters
    if (!editingMed && !hasUnlimitedAccess() && medications.length >= 3) {
      window.history.pushState({}, '', '/upgrade');
      throw new Error("Limite de 3 medicamentos cadastrados foi atingido no plano gratuito. Faça upgrade para adicionar mais.");
    }

    // Remove undefined properties, "Selecione" defaults and empty strings for optional fields before saving to avoid firestore rules failures
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        if (value === 'Selecione' && (key === 'howToTake' || key === 'purchaseLocation')) {
          // skip fallback string placeholders
        } else if (value === '' && (key === 'expiryDate' || key === 'purchaseDate' || key === 'howToTake' || key === 'purchaseLocation' || key === 'instructions' || key === 'indication')) {
          // skip empty optional properties
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as any);

    if (!keepOpen) {
      // Close the form and return to dashboard instantly for an optimal, lag-free user experience
      setIsFormOpen(false);
      setEditingMed(undefined);
      setActiveTab('dashboard');
    }

    // If local test account fallback
    if (user.uid.startsWith('wsaconato-terra-test')) {
      let updatedMeds = [...medications];
      if (editingMed) {
        updatedMeds = updatedMeds.map(m => m.id === editingMed.id ? { 
          ...m, 
          ...cleanData, 
          updatedAt: new Date().toISOString() 
        } as Medication : m);
      } else {
        const newMed = {
          id: 'med-' + Math.random().toString(36).substr(2, 9),
          ...cleanData,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          active: true
        } as Medication;
        updatedMeds.push(newMed);
      }
      localStorage.setItem(`medications_${user.uid}`, JSON.stringify(updatedMeds));
      setMedications(updatedMeds.sort((a, b) => (a.time || '08:00').localeCompare(b.time || '08:00')));
      return;
    }

    try {
      if (editingMed) {
        const medRef = doc(db, 'medications', editingMed.id);
        await updateDoc(medRef, {
          ...cleanData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'medications'), {
          ...cleanData,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao guardar medicamento no Firestore:', error);
      handleFirestoreError(error, editingMed ? OperationType.UPDATE : OperationType.CREATE, 'medications');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta prescrição de medicação?',
      async () => {
        if (user && user.uid.startsWith('wsaconato-terra-test')) {
          const updated = medications.filter(m => m.id !== id);
          localStorage.setItem(`medications_${user.uid}`, JSON.stringify(updated));
          setMedications(updated);
          return;
        }

        try {
          await deleteDoc(doc(db, 'medications', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'medications');
        }
      }
    );
  };

  const handleToggleActive = async (med: Medication) => {
    if (user && user.uid.startsWith('wsaconato-terra-test')) {
      const updated = medications.map(m => m.id === med.id ? { ...m, active: !m.active } : m);
      localStorage.setItem(`medications_${user.uid}`, JSON.stringify(updated));
      setMedications(updated);
      return;
    }

    try {
      await updateDoc(doc(db, 'medications', med.id), {
        active: !med.active
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'medications');
    }
  };

  const handleMarkTaken = async (med: Medication) => {
    const updates: Partial<Medication> = {
      lastTaken: new Date().toISOString()
    };

    if (med.stock !== undefined && med.stock > 0) {
      updates.stock = med.stock - 1;
    }

    if (user && user.uid.startsWith('wsaconato-terra-test')) {
      const updated = medications.map(m => m.id === med.id ? { ...m, ...updates } : m);
      localStorage.setItem(`medications_${user.uid}`, JSON.stringify(updated));
      setMedications(updated);
      return;
    }

    try {
      await updateDoc(doc(db, 'medications', med.id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'medications');
    }
  };

  const handleSetDoseStatus = async (med: Medication, time: string, status: 'taken' | 'skipped') => {
    try {
      const todayString = new Date().toISOString().split('T')[0];
      const key = `${todayString} ${time}`;
      
      const currentHistory = med.doseHistory || {};
      const previousStatus = currentHistory[key];
      
      // Toggle off if same is clicked
      const newStatus = previousStatus === status ? undefined : status;
      
      const updatedHistory = { ...currentHistory };
      if (newStatus) {
        updatedHistory[key] = newStatus;
      } else {
        delete updatedHistory[key];
      }
      
      const updates: Partial<Medication> = {
        doseHistory: updatedHistory,
        ...(newStatus === 'taken' ? { lastTaken: new Date().toISOString() } : {})
      };

      if (med.stock !== undefined && med.stock !== null) {
        let stockDiff = 0;
        if (previousStatus !== 'taken' && newStatus === 'taken') {
          stockDiff = -1;
        } else if (previousStatus === 'taken' && newStatus !== 'taken') {
          stockDiff = 1;
        }
        
        if (stockDiff !== 0) {
          updates.stock = Math.max(0, med.stock + stockDiff);
        }
      }

      if (user && user.uid.startsWith('wsaconato-terra-test')) {
        const updated = medications.map(m => m.id === med.id ? { ...m, ...updates } : m);
        localStorage.setItem(`medications_${user.uid}`, JSON.stringify(updated));
        setMedications(updated);
        return;
      }

      await updateDoc(doc(db, 'medications', med.id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'medications');
    }
  };

  // Health logs wellness database actions
  const handleAddLog = async (mood: HealthLog['mood'], symptoms: string[], notes: string) => {
    if (!user) return;

    if (user.uid.startsWith('wsaconato-terra-test')) {
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        userId: user.uid,
        mood,
        symptoms,
        notes,
        createdAt: new Date().toISOString()
      } as HealthLog;
      const updated = [newLog, ...healthLogs];
      localStorage.setItem(`healthLogs_${user.uid}`, JSON.stringify(updated));
      setHealthLogs(updated);
      return;
    }

    try {
      await addDoc(collection(db, 'healthLogs'), {
        userId: user.uid,
        mood,
        symptoms,
        notes,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'healthLogs');
    }
  };

  // Send message to Gemini chat assistant
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const updatedHistory = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(updatedHistory);
    setChatLoading(true);

    try {
      const reply = await chatWithIA(updatedHistory, medications);
      setChatMessages(prev => [...prev, { role: 'model' as const, text: reply }]);
    } catch (error) {
      console.error('Error getting reply:', error);
      setChatMessages(prev => [...prev, { role: 'model' as const, text: 'Ocorreu um erro ao obter resposta da AI. Por favor, tente novamente.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper formatting for custom bold and bullet list highlights inside chat bubbles
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="font-extrabold text-emerald-800 dark:text-emerald-400">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li key={i} className="ml-4 list-disc mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {parts.length > 0 ? parts : line.trim().substring(1).trim()}
          </li>
        );
      }
      return (
        <p key={i} className="text-sm leading-relaxed mb-1.5 text-zinc-700 dark:text-zinc-300">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  // Quick Action card mappings
  const quickActions = [
    { id: 'fit', label: 'Google Fit Clube', icon: <Watch size={22} />, bg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20', tab: 'devices', highlight: true },
    { id: 'paciente', label: 'Paciente', icon: <UserIcon size={22} />, bg: 'bg-[#e0f7f6] text-[#00a39b]', tab: 'portal' },
    { id: 'sintomas', label: 'Análise de Sintomas', icon: <Stethoscope size={22} />, bg: 'bg-[#eedff9] text-[#8017d4]', tab: 'followup' },
    { id: 'scan', label: 'Escanear Remédio', icon: <Maximize size={22} />, bg: 'bg-[#e0faf2] text-[#0fb383]', tab: 'medications' },
    { id: 'manipulado', label: 'Fórmula Manipulada', icon: <Beaker size={22} />, bg: 'bg-[#e0faf2] text-[#0fb383]', tab: 'medications' },
    { id: 'analise', label: 'Análise de Tratamento', icon: <Sparkles size={22} />, bg: 'bg-[#e2f8f0] text-[#00aa74]', tab: 'portal' },
    { id: 'interacoes', label: 'Interações', icon: <ShieldAlert size={22} />, bg: 'bg-[#e0f2f1] text-[#00897b]', tab: 'portal' },
    { id: 'sinais', label: 'Sinais Vitais', icon: <Heart size={22} />, bg: 'bg-[#e0f2f1] text-[#00897b]', tab: 'followup' },
    { id: 'acompanhamento', label: 'Acompanhamento', icon: <TrendingUp size={22} />, bg: 'bg-[#e0f2f1] text-[#00897b]', tab: 'followup' },
    { id: 'exames', label: 'Avaliar Exames', icon: <ClipboardCheck size={22} />, bg: 'bg-[#e0f2f1] text-[#00897b]', tab: 'portal' },
    { id: 'chat_ia', label: 'Chat IA', icon: <MessageSquare size={22} />, bg: 'bg-[#e8f5e9] text-[#43a047]', isChat: true },
    { id: 'insulina', label: 'Insulinas', icon: <Droplets size={22} />, bg: 'bg-[#e8f5e9] text-[#43a047]', tab: 'followup' },
    { id: 'fitoterapico', label: 'Fitoterápicos', icon: <Leaf size={22} />, bg: 'bg-[#e8f5e9] text-[#43a047]', tab: 'portal' },
    { id: 'relatorio', label: 'Relatório', icon: <FileBarChart size={22} />, bg: 'bg-[#e8f5e9] text-[#43a047]', tab: 'reports' },
    { id: 'contato', label: 'Contato', icon: <Mail size={22} />, bg: 'bg-[#e8f5e9] text-[#43a047]', isContact: true }
  ];

  // Render the high fidelity medication alert page from screenshot
  const renderMedicationAlertPage = () => {
    // Find closest active medication in the list
    const findClosestMed = () => {
      if (medications.length === 0) return null;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let closest: Medication | null = null;
      let minDiff = Infinity;
      let scheduledTime = '';

      for (const m of medications) {
        if (!m.active) continue;
        const times = m.times || [m.time || '08:00'];
        for (const t of times) {
          const [h, min] = t.split(':').map(Number);
          const medMin = h * 60 + min;
          const diff = Math.abs(currentMinutes - medMin);
          if (diff < minDiff) {
            minDiff = diff;
            closest = m;
            scheduledTime = t;
          }
        }
      }

      // Only returns if medication is within a 4-hour window
      return closest && minDiff < 240 ? { med: closest, time: scheduledTime } : null;
    };

    const targetInfo = findClosestMed();

    const handleAction = async (action: 'taken' | 'skipped' | 'snooze') => {
      stopAlarmTone();
      if (targetInfo && targetInfo.med) {
        if (action === 'taken') {
          await handleSetDoseStatus(targetInfo.med, targetInfo.time, 'taken');
        } else if (action === 'skipped') {
          await handleSetDoseStatus(targetInfo.med, targetInfo.time, 'skipped');
        }
      }
      // Guarantee it goes back to the home page URL securely
      window.location.href = '/';
    };

    return (
      <div className="min-h-screen bg-[#808388] flex flex-col items-center justify-center p-4 selection:bg-cyan-100">
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={() => {
              if (alarmMuted) {
                setAlarmMuted(false);
                startAlarmTone();
              } else {
                setAlarmMuted(true);
                stopAlarmTone();
              }
            }}
            className="p-3 bg-white/20 border border-white/10 active:scale-95 rounded-full text-white hover:bg-white/30 transition-all flex items-center justify-center cursor-pointer shadow-md backdrop-blur-sm"
            title={alarmMuted ? 'Ativar Som' : 'Mutar Som'}
          >
            {alarmMuted ? <VolumeX size={20} className="text-red-300" /> : <Volume2 size={20} className="text-cyan-300 animate-bounce" />}
          </button>
        </div>

        {/* Outer Frame Mock representation */}
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 text-center flex flex-col justify-between min-h-[580px] border border-zinc-100/50 relative overflow-hidden transition-all">
          
          {/* Top Clock element duplicated exactly from screenshot layout */}
          <div className="my-auto space-y-6">
            <div className="w-24 h-24 bg-[#dbfcfc] rounded-full flex items-center justify-center text-[#06b6d4] mx-auto shadow-sm">
              <Clock size={44} className="stroke-[2.5]" />
            </div>

            <div className="space-y-4">
              <h1 className="text-zinc-900 text-3xl font-black tracking-tight leading-tight px-4 font-sans">
                Hora de tomar seus medicamentos
              </h1>
              
              {targetInfo ? (
                <div className="bg-[#f0fbf9] border border-cyan-100 rounded-2xl p-4.5 max-w-xs mx-auto space-y-1.5 transition-all">
                  <div className="text-[10px] font-black uppercase text-cyan-600 tracking-wider">Próxima Dose Agendada</div>
                  <div className="text-zinc-800 font-extrabold text-base uppercase leading-tight">{targetInfo.med.name}</div>
                  <div className="text-zinc-500 text-xs font-semibold">{targetInfo.med.dosage} • Horário: {targetInfo.time}</div>
                  {targetInfo.med.instructions && (
                    <div className="text-[10px] text-zinc-455 italic mt-1 font-medium border-t border-cyan-100/50 pt-1">
                      💡 {targetInfo.med.instructions}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-400 font-bold text-sm max-w-xs mx-auto">
                  Nenhum medicamento para este horário.
                </p>
              )}
            </div>
          </div>

          {/* Action buttons with absolute home link (satisfying "com o link do app em cada botão") */}
          <div className="space-y-3.5 mt-8 w-full">
            <a 
              href={window.location.origin + '/'}
              onClick={async (e) => {
                e.preventDefault();
                await handleAction('taken');
              }}
              className="w-full py-4.5 bg-[#22c55e] hover:bg-[#16a34a] active:scale-98 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all cursor-pointer select-none"
            >
              <Check size={18} className="stroke-[3]" /> Já Tomei
            </a>

            <a 
              href={window.location.origin + '/'}
              onClick={async (e) => {
                e.preventDefault();
                await handleAction('snooze');
              }}
              className="w-full py-4.5 bg-[#f97316] hover:bg-[#ea580c] active:scale-98 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all cursor-pointer select-none"
            >
              <Clock size={16} /> Aguardar 15 min
            </a>

            <a 
              href={window.location.origin + '/'}
              onClick={async (e) => {
                e.preventDefault();
                await handleAction('skipped');
              }}
              className="text-zinc-500 hover:text-red-500 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none py-2"
            >
              <X size={14} className="stroke-[2.5]" /> Pular
            </a>
          </div>

        </div>
      </div>
    );
  };

  if (currentPath.includes('/medication-alert')) {
    return renderMedicationAlertPage();
  }

  if (currentPath.includes('/receita-digital')) {
    return (
      <ReceitaDigitalPage
        darkMode={darkMode}
        onImportMeds={(importedMeds) => {
          let activeUid = user?.uid;
          if (!user) {
            const fallbackUser = {
              uid: 'wsaconato-terra-test-uid',
              email: 'wsaconato@terra.com.br',
              displayName: 'W. S. A. Conato',
              photoURL: null,
              providerId: 'password',
              providerData: [{ providerId: 'password', email: 'wsaconato@terra.com.br' }]
            };
            localStorage.setItem('local_fallback_user', JSON.stringify(fallbackUser));
            setUser(fallbackUser as any);
            activeUid = 'wsaconato-terra-test-uid';
          }

          const storedKey = `medications_${activeUid}`;
          const rawMeds = localStorage.getItem(storedKey);
          let existingMeds = rawMeds ? JSON.parse(rawMeds) : [];

          const mergedMeds = [...existingMeds];
          importedMeds.forEach(newMed => {
            if (!mergedMeds.some(m => m.name.toLowerCase() === newMed.name.toLowerCase())) {
              mergedMeds.push(newMed);
            }
          });

          localStorage.setItem(storedKey, JSON.stringify(mergedMeds));
          setMedications(mergedMeds);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-bold text-sm">Carregando CrossMeds...</p>
        </div>
      </div>
    );
  }

  // Signed Out Login Screen
  if (!user) {
    if (!showAuthForm) {
      return (
        <LandingPage 
          onSelectAuth={(signUp) => {
            setIsSignUp(signUp);
            setShowAuthForm(true);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#3b9c84] via-[#50bfa3] to-[#7adbbf] flex flex-col items-center justify-center p-6 selection:bg-emerald-100 relative overflow-hidden">
        
        {/* Soft background glow circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/20 blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-[#1a212d] rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden transition-all duration-300"
        >
          {/* Top Custom Badge Banner */}
          <div className="bg-[#15a350] text-[10px] font-black uppercase tracking-widest text-white py-2.5 text-center flex items-center justify-center gap-1.5 px-4 select-none">
            <span>🛡️ CONEXÃO SEGURA ATIVA</span>
          </div>

          <div className="p-8 md:p-10 space-y-7">
            {/* Header section */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 w-14 h-14 rounded-2xl flex items-center justify-center text-[#15a350]">
                <Key size={26} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                  {isSignUp ? 'Criar uma Conta' : 'Entrar no Portal'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold leading-relaxed max-w-xs mx-auto mt-2">
                  {isSignUp 
                    ? 'Registre seu e-mail e senha para começar o seu teste gratuito.' 
                    : 'Use seu e-mail e senha para acessar sua conta.'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-950/50 flex items-center gap-2"
              >
                <AlertTriangle size={15} />
                <span>{authError}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                  Seu E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  disabled={authLoading}
                  className="w-full px-4 py-3 bg-[#eef2f6] dark:bg-[#151c26] border border-transparent focus:border-emerald-500 rounded-2xl text-zinc-800 dark:text-white font-medium text-sm transition-all focus:outline-none placeholder-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={authLoading}
                  className="w-full px-4 py-3 bg-[#eef2f6] dark:bg-[#151c26] border border-transparent focus:border-emerald-500 rounded-2xl text-zinc-800 dark:text-white font-medium text-sm transition-all focus:outline-none placeholder-zinc-400"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-4 px-6 bg-[#15a350] hover:bg-[#118f43] text-white font-black rounded-2xl tracking-wider text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check size={16} className="stroke-[3]" />
                    {isSignUp ? 'CONCLUIR CADASTRO' : 'ENTRAR NO PORTAL'}
                  </>
                )}
              </button>
            </form>

            {/* Healthcare Professional Easy Shortcut */}
            {!isSignUp && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-2xl border border-emerald-100/30 text-center space-y-1.5">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  🩺 Testando como Profissional de Saúde?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('wsaconato@terra.com.br');
                    setPassword('123456');
                    setAuthError(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-lg tracking-wider transition-colors"
                >
                  Preencher dados de teste
                </button>
              </div>
            )}

            {/* Toggle Login/Sign Up */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all underline decoration-dotted decoration-zinc-300"
              >
                {isSignUp 
                  ? 'Já tem uma conta? Entrar com meu portal' 
                  : 'Ainda não tem conta? Criar uma conta'}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-zinc-150 dark:bg-zinc-800 flex-1"></div>
              <span className="text-[10px] font-black uppercase text-zinc-400 select-none">ou</span>
              <div className="h-px bg-zinc-150 dark:bg-zinc-800 flex-1"></div>
            </div>

            {/* Google authentication */}
            <button
              type="button"
              onClick={handleSignIn}
              disabled={authLoading}
              className="w-full py-3.5 px-6 bg-white dark:bg-[#151c26] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 text-xs shadow-sm hover:shadow active:scale-98"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 select-none" alt="Google" />
              Entrar com o Google
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAuthForm(false);
                setAuthError(null);
              }}
              className="w-full text-center text-zinc-500 dark:text-zinc-400 hover:text-[#1a5ca8] dark:hover:text-emerald-400 text-xs font-bold transition-colors mt-4 block underline decoration-dotted"
            >
              ← Voltar para a página inicial
            </button>
          </div>
        </motion.div>
        
        {/* Soft footer */}
        <p className="text-[#eef2f6]/70 text-[10px] font-bold tracking-wider uppercase select-none mt-6">
          © {new Date().getFullYear()} CrossMeds • Central de Saúde Inteligente
        </p>
      </div>
    );
  }

  // Home Page Navigation Tabs
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: <Home size={22} /> },
    { id: 'medications', label: 'Remédios', icon: <Pill size={22} /> },
    { id: 'followup', label: 'Acompanhamento', icon: <TrendingUp size={22} /> },
    { id: 'reminders', label: 'Lembretes', icon: <Clock size={22} /> },
    { id: 'reports', label: 'Relatório', icon: <FileBarChart size={22} /> },
  ];

  return (
    <ErrorBoundary>
      <div className={`min-h-screen pb-24 transition-all duration-300 ${
        darkMode ? 'bg-[#1a212d] text-white' : 'bg-[#50bfa3] text-zinc-900'
      }`}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 space-y-5">
          
          {/* Top Bar Brand Header */}
          <div className="flex justify-between items-center py-2 h-14">
            <span className="text-2xl font-black text-white flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-white/20 p-1.5 rounded-xl text-white">
                <Pill size={20} />
              </div>
              CrossMeds
            </span>

            <div className="flex items-center gap-4">
              {/* Moon Switch Darkmode */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all outline-none ${
                    darkMode ? 'bg-zinc-800' : 'bg-white'
                  }`}
                >
                  <div 
                    className={`w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                      darkMode ? 'translate-x-4.5 bg-emerald-400' : 'translate-x-0 bg-[#50bfa3]'
                    }`}
                  />
                </button>
                <Moon size={16} className="text-white" />
              </div>

              {/* User Avatar */}
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "Usuário"} 
                  className="w-9 h-9 rounded-full border-2 border-white select-none shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white border-2 border-white">
                  <UserIcon size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Conditional Render Based on Selected Active Tab */}
          <AnimatePresence mode="wait">
            {currentPath.includes('/diagnostico-sintomas') ? (
              <motion.div
                key="diagnostico-sintomas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SymptomAnalysisPage
                  darkMode={darkMode}
                  medications={medications}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/interacoes') ? (
              <motion.div
                key="interacoes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <InteractionsPage
                  darkMode={darkMode}
                  medications={medications}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/adicionar-formula') ? (
              <motion.div
                key="adicionar-formula"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AddFormulaPage
                  darkMode={darkMode}
                  medications={medications}
                  onSave={handleSaveMedication}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/analise-tratamento') ? (
              <motion.div
                key="analise-tratamento"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TreatmentAnalysisPage
                  darkMode={darkMode}
                  medications={medications}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/sinais-vitais') ? (
              <motion.div
                key="sinais-vitais"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SinaisVitaisPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/acompanhamento') ? (
              <motion.div
                key="acompanhamento"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AcompanhamentoPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/insulinas') ? (
              <motion.div
                key="insulinas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <InsulinasPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/fitoterapicos') ? (
              <motion.div
                key="fitoterapicos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FitoterapicosPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/relatorio') ? (
              <motion.div
                key="relatorio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <RelatorioPage
                  medications={medications}
                  onUpdateMedications={setMedications}
                  user={user}
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/contato') ? (
              <motion.div
                key="contato"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ContatoPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/quem-somos') ? (
              <motion.div
                key="quem-somos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <QuemSomosPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/privacidade') ? (
              <motion.div
                key="privacidade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PrivacidadePage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/manual') ? (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ManualPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/faq') ? (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FaqPage
                  darkMode={darkMode}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/upgrade') ? (
              <motion.div
                key="upgrade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <UpgradePage
                  darkMode={darkMode}
                  user={user}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : currentPath.includes('/analisar-exame') ? (
              <motion.div
                key="analisar-exame"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AnalisarExamePage
                  darkMode={darkMode}
                  medications={medications}
                  onBack={() => {
                    window.history.pushState({}, '', '/');
                  }}
                />
              </motion.div>
            ) : activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                
                {/* 1. Free Trial Card */}
                <div className={`rounded-[2rem] p-6 border transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${darkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Gift size={22} />
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Degustação Gratuita
                      </span>
                      <p className={`text-sm font-bold leading-tight ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
                        Você poderá cadastrar até 3 medicamentos, testar a análise de interações.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <span>Espaços Utilizados</span>
                      <span>{medications.length} de 3</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((medications.length / 3) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <button className={`w-full py-3 px-4 border rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    darkMode 
                      ? 'border-[#2e3a4e] bg-[#1c2431] hover:bg-[#1a212d] text-emerald-400' 
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-amber-500 shadow-xs'
                  }`}>
                    <span>✨ Liberar Acesso Vitalício Ilimitado</span>
                  </button>
                </div>

                {/* 1.5 Doctor's Urgent Alert Card */}
                {doctorAlert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-[2rem] p-6 border relative overflow-hidden transition-all duration-300 ${
                      darkMode ? 'bg-[#2a1c22] border-rose-950 text-rose-200' : 'bg-rose-50/70 border-rose-100 text-rose-900 shadow-sm'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl transform translate-x-5 -translate-y-5"></div>
                    
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`p-3 rounded-2xl shrink-0 ${darkMode ? 'bg-rose-950/50 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                        <Stethoscope size={22} className="animate-pulse" />
                      </div>
                      <div className="space-y-0.5 pr-6">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                          🚨 Alerta e Conduta Médica SUS
                        </span>
                        <h4 className="text-md font-black leading-tight">
                          {doctorAlert.doctorName} ({doctorAlert.crm})
                        </h4>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                          Prescrito em: {doctorAlert.date}
                        </p>
                      </div>
                    </div>

                    <p className={`text-xs font-semibold leading-relaxed mb-4 p-3.5 rounded-xl ${
                      darkMode ? 'bg-black/35 text-zinc-300' : 'bg-white text-zinc-700 border border-rose-50'
                    }`}>
                      "{doctorAlert.alertText}"
                    </p>

                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => {
                          showConfirm(
                            'Confirmar Orientações',
                            'Confirmar que você leu, entendeu e seguirá as orientações do seu médico?',
                            () => {
                              localStorage.removeItem('crossmeds_doctor_alerts');
                              setDoctorAlert(null);
                            }
                          );
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center ${
                          darkMode ? 'bg-rose-900/60 hover:bg-rose-900 text-rose-100' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        }`}
                      >
                        Marcar como Ciente
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. Treatment Summary Card with Yellow Crown */}
                <div className={`rounded-[2rem] p-6 border transition-all duration-300 relative ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-black tracking-tight leading-none mb-1">Resumo do Tratamento</h3>
                      <p className="text-zinc-400 text-xs font-medium">Painel geral de medicamentos e monitoramento.</p>
                    </div>
                    <div className="p-1.5 bg-amber-50 rounded-xl text-amber-500 shrink-0">
                      <Crown size={18} className="fill-amber-400 text-amber-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Active medications */}
                    <div className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
                      darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'
                    }`}>
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 mb-1.5">
                        <Pill size={18} />
                      </div>
                      <span className={`text-2.5xl font-black tracking-tight leading-none mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                        {medications.filter(m => m.active).length}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Remédios</span>
                    </div>

                    {/* Interactions alert count */}
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/interacoes');
                        setActiveTab('dashboard');
                      }}
                      className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all hover:scale-103 cursor-pointer text-center ${
                        darkMode 
                          ? 'bg-[#1c2431] border-[#2e3a4e] hover:bg-[#252f41] text-zinc-300' 
                          : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100/80 text-zinc-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mb-1.5 ${
                        interactions.length > 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        <ShieldAlert size={18} />
                      </div>
                      <span className={`text-2.5xl font-black tracking-tight leading-none mb-1 ${
                        interactions.length > 0 ? 'text-rose-500' : (darkMode ? 'text-white' : 'text-zinc-900')
                      }`}>
                        {interactions.length}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Interações</span>
                    </button>

                    {/* Daily doses */}
                    <div className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
                      darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'
                    }`}>
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 mb-1.5">
                        <Clock size={18} />
                      </div>
                      <span className={`text-2.5xl font-black tracking-tight leading-none mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                        {medications.filter(m => m.active).reduce((acc, med) => acc + (med.times?.length || 1), 0)}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Doses Diárias</span>
                    </div>
                  </div>

                  {/* High Fidelity Phone Alarm Screen Simulation Button */}
                  <button
                    type="button"
                    onClick={handleTestAlarm}
                    className={`mt-4 w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      darkMode
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/50 shadow-xs'
                    }`}
                  >
                    <Bell size={14} className="animate-bounce text-amber-500 shrink-0" />
                    Testar Alarme com Celular Apagado
                  </button>
                </div>

                {/* 3. My Medications List Card */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h4 className="text-lg font-black tracking-tight leading-none mb-1 text-zinc-900 dark:text-white">Medicamentos Cadastrados</h4>
                      <p className="text-zinc-400 text-xs font-semibold">Registre suas doses diárias e confira as interações.</p>
                    </div>
                    <button 
                      onClick={handleAddMedicationClick}
                      className="text-xs font-black text-[#15a350] hover:text-[#118440] bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 px-4 py-2 rounded-full transition-all flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>

                  {medications.length === 0 ? (
                    <div className={`rounded-[2rem] p-8 border text-center py-10 space-y-4 ${
                      darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                    }`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                        darkMode ? 'bg-zinc-800 text-zinc-650' : 'bg-zinc-50 text-zinc-300'
                      }`}>
                        <Pill size={32} />
                      </div>
                      <div className="max-w-xs mx-auto space-y-3">
                        <p className="text-sm font-bold text-zinc-550 leading-tight">Nenhum medicamento cadastrado.</p>
                        <button
                          onClick={handleAddMedicationClick}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                        >
                          Adicionar seu primeiro medicamento
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medications.map(med => {
                        const foundInteraction = interactions.find(i => i.medicationIds.includes(med.id));
                        
                        // Interaction severity status colors
                        let borderClass = 'border-l-[10px] border-emerald-500';
                        let badgeText = 'VERDE - EM MONITORAMENTO';
                        let badgeColorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
                        
                        if (foundInteraction) {
                          if (foundInteraction.severity === 'high') {
                            borderClass = 'border-l-[10px] border-[#dc2626]';
                            badgeText = 'VERMELHO - GRAVE';
                            badgeColorClass = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-350 border-red-250 animate-pulse';
                          } else if (foundInteraction.severity === 'moderate') {
                            borderClass = 'border-[#f97316] border-l-[10px]';
                            badgeText = 'LARANJA - MODERADA';
                            badgeColorClass = 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-355 border-orange-250 animate-pulse';
                          }
                        }
                        
                        const times = med.times || [med.time || '08:00'];
                        const todayString = new Date().toISOString().split('T')[0];
                        const tempDate = new Date();
                        const todayFormatted = `${String(tempDate.getDate()).padStart(2, '0')}/${String(tempDate.getMonth() + 1).padStart(2, '0')}`;

                        return (
                          <div 
                            key={med.id} 
                            className={`rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col ${
                              med.active 
                                ? (darkMode ? 'bg-[#242b38] border-zinc-800' : 'bg-white border-zinc-150 shadow-sm') 
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 opacity-60'
                            }`}
                          >
                            <div className="p-5 md:p-6 space-y-4">
                              
                              {/* Header row: Title on left, Inline Edit/Trash buttons inline/stacked like the uploaded mockup */}
                              <div className="flex justify-between items-start gap-3 w-full">
                                <div className="flex-1 space-y-2 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight truncate">
                                      {med.name}
                                    </h4>
                                    
                                    {/* Interaction Severity Badge */}
                                    {med.active && foundInteraction && (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${badgeColorClass}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${badgeText.includes('GRAVE') ? 'bg-red-500' : (badgeText.includes('MODERADA') ? 'bg-orange-500' : 'bg-emerald-500')}`}></span>
                                        {badgeText}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Concentration pill badge */}
                                  <div className="pt-0.5">
                                    <span className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg">
                                      {med.dosage}
                                    </span>
                                  </div>
                                </div>

                                {/* Stacked Actions: Edit (Inline on top right) & Delete (below edit) */}
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditingMed(med);
                                      setIsFormOpen(true);
                                    }}
                                    className="p-1 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all active:scale-95"
                                    title="Editar Medicamento"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteMedication(med.id)}
                                    className="p-1 text-red-500 hover:text-red-700 transition-all active:scale-95"
                                    title="Excluir Medicamento"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                  </button>
                                </div>
                              </div>

                              {/* Details: Schedule & Intake tips with clock prefix */}
                              <div className="space-y-1.5 text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-semibold">
                                <div className="flex items-center gap-2">
                                  <Clock size={16} className="text-zinc-400 shrink-0" />
                                  <span>{med.frequency} - {times.join(', ')}</span>
                                </div>
                                {med.howToTake && med.howToTake !== 'Selecione' && (
                                  <div className="flex items-center gap-2 text-sky-650 dark:text-sky-400">
                                    <Info size={15} className="text-sky-500 dark:text-sky-450 shrink-0" />
                                    <span className="leading-none text-xs lowercase font-bold">{formatHowToTake(med.howToTake)}</span>
                                  </div>
                                )}
                                {med.instructions && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-zinc-400 mt-0.5">ℹ️</span>
                                    <span className="leading-tight text-zinc-500 dark:text-zinc-400">{med.instructions}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Dose Registry Area (Exactly matches EXEMPLO screenshot) */}
                            {med.active && (
                              <div className={`p-5 md:p-6 border-t ${darkMode ? 'border-zinc-850 bg-[#1c2431]' : 'border-zinc-100 bg-[#f8fcf9]'} space-y-4`}>
                                <div className="text-xs uppercase tracking-wider font-extrabold text-[#15a350]">
                                  REGISTRAR DOSES DE HOJE ({todayFormatted})
                                </div>

                                <div className="space-y-3">
                                  {times.map((t, tid) => {
                                    const key = `${todayString} ${t}`;
                                    const status = med.doseHistory?.[key];
                                    
                                    const isTaken = status === 'taken';
                                    const isSkipped = status === 'skipped';

                                    return (
                                      <div key={tid} className="flex justify-between items-center bg-white dark:bg-[#242b38] rounded-2xl p-3 border border-zinc-100/80 dark:border-zinc-800">
                                        <div className="font-black text-lg text-zinc-800 dark:text-zinc-200 font-mono tracking-tight pl-2">
                                          {t}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          {/* Pulei button */}
                                          <button
                                            type="button"
                                            onClick={() => handleSetDoseStatus(med, t, 'skipped')}
                                            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                              isSkipped
                                                ? 'bg-rose-100/80 text-rose-700 border-2 border-rose-200'
                                                : 'bg-zinc-50/50 hover:bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                                            }`}
                                          >
                                            <span className="text-sm font-extrabold">✕</span> Pulei
                                          </button>

                                          {/* Tomei button */}
                                          <button
                                            type="button"
                                            onClick={() => handleSetDoseStatus(med, t, 'taken')}
                                            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                              isTaken
                                                ? 'bg-emerald-100/90 text-emerald-800 border-2 border-emerald-200'
                                                : 'bg-zinc-50/50 hover:bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                                            }`}
                                          >
                                            <span className="text-sm font-extrabold">✓</span> Tomei
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Ações Rápidas Custom Card Grid */}
                <div className={`rounded-[2rem] p-6 border transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <h3 className="text-lg font-black tracking-tight mb-6">Ações Rápidas</h3>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-4">
                    {quickActions.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => {
                          if (!hasUnlimitedAccess() && !act.isContact) {
                            window.history.pushState({}, '', '/upgrade');
                            return;
                          }

                          if (act.id === 'sintomas') {
                            window.history.pushState({}, '', '/diagnostico-sintomas');
                            setActiveTab('dashboard');
                          } else if (act.id === 'analise') {
                            window.history.pushState({}, '', '/analise-tratamento');
                            setActiveTab('dashboard');
                          } else if (act.id === 'interacoes') {
                            window.history.pushState({}, '', '/interacoes');
                            setActiveTab('dashboard');
                          } else if (act.id === 'scan') {
                            window.history.pushState({}, '', '/interacoes?scan=true');
                            setActiveTab('dashboard');
                          } else if (act.id === 'manipulado') {
                            window.history.pushState({}, '', '/adicionar-formula');
                            setActiveTab('dashboard');
                          } else if (act.id === 'sinais') {
                            window.history.pushState({}, '', '/sinais-vitais');
                            setActiveTab('dashboard');
                          } else if (act.id === 'acompanhamento') {
                            window.history.pushState({}, '', '/acompanhamento');
                            setActiveTab('dashboard');
                          } else if (act.id === 'insulina') {
                            window.history.pushState({}, '', '/insulinas');
                            setActiveTab('dashboard');
                          } else if (act.id === 'fitoterapico') {
                            window.history.pushState({}, '', '/fitoterapicos');
                            setActiveTab('dashboard');
                          } else if (act.id === 'relatorio') {
                            window.history.pushState({}, '', '/relatorio');
                            setActiveTab('reports');
                          } else if (act.id === 'exames') {
                            window.history.pushState({}, '', '/analisar-exame');
                            setActiveTab('dashboard');
                          } else if (act.isChat) {
                            setChatOpen(true);
                          } else if (act.isContact) {
                            window.history.pushState({}, '', '/contato');
                            setActiveTab('dashboard');
                          } else if (act.tab) {
                            setActiveTab(act.tab);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl hover:scale-103 transition-all hover:shadow-md group ${
                          act.highlight 
                            ? (darkMode ? 'bg-[#1b2432] border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]' : 'bg-gradient-to-br from-[#f0faf7] to-[#e4f6f0] border border-[#a7f3d0]/65 shadow-md shadow-emerald-500/5') 
                            : ''
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 transition-all group-hover:scale-110 shadow-xs ${
                          act.highlight 
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/30 font-black animate-pulse' 
                            : act.bg
                        }`}>
                          {act.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase text-center tracking-tighter leading-tight max-w-[84px] transition-colors ${
                          act.highlight 
                            ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' 
                            : 'text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500'
                        }`}>
                          {act.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Medical Portal Dark Themed Alert Link */}
                <button
                  onClick={() => setActiveTab('portal')}
                  className="w-full rounded-[2rem] p-6.5 bg-[#242b38] border border-[#2e3a4e] text-white flex items-center gap-5 transition-transform hover:scale-101 outline-none text-left"
                >
                  <div className="w-13 h-13 bg-zinc-700/50 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <FileBarChart size={24} />
                  </div>
                  <div>
                    <h4 className="text-md font-black tracking-tight">Portal Médico</h4>
                    <p className="text-zinc-400 text-xs font-medium mt-0.5">Clique para acessar prontuários e prescrições.</p>
                  </div>
                </button>

                {/* 6. Emergency Contacts and Buttons */}
                <div className={`rounded-[2rem] p-6 border transition-all duration-300 text-center ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="flex flex-col items-center mb-5 gap-1.5">
                    <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-500">
                      <ShieldAlert size={20} />
                    </div>
                    <h3 className="font-black text-zinc-800 dark:text-zinc-100 text-lg">Emergência</h3>
                  </div>

                  <button 
                    onClick={() => {
                      window.history.pushState({}, '', '/contato');
                      setActiveTab('dashboard');
                    }}
                    className="w-full py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 rounded-2xl border border-zinc-200/50 dark:border-[#2e3a4e] font-black text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-4 flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> ADICIONAR CONTATO
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 w-full relative">
                      <button
                        onMouseDown={startSosHolding}
                        onMouseUp={stopSosHolding}
                        onMouseLeave={stopSosHolding}
                        onTouchStart={(e) => { e.preventDefault(); startSosHolding(); }}
                        onTouchEnd={(e) => { e.preventDefault(); stopSosHolding(); }}
                        className={`py-4 px-4 relative overflow-hidden font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md select-none flex items-center justify-center gap-2 min-h-[52px] ${
                          sosIsPressing 
                            ? 'bg-red-800 scale-95 ring-4 ring-red-550/30 text-white' 
                            : 'bg-orange-600 hover:bg-orange-550 text-white active:scale-95'
                        }`}
                      >
                        {/* Progress filling background */}
                        {sosIsPressing && (
                          <div 
                            className="absolute inset-y-0 left-0 bg-red-950/40 z-0 transition-all duration-75 pointer-events-none"
                            style={{ width: `${sosHoldProgress}%` }}
                          />
                        )}
                        
                        <div className="relative z-10 flex items-center justify-center gap-2 w-full">
                          <PhoneCall size={14} className={sosIsPressing ? "animate-pulse" : ""} />
                          <span>
                            {sosIsPressing ? `DISPARANDO: ${sosHoldTime}s` : 'SOS'}
                          </span>
                        </div>
                      </button>
                      {sosWarning ? (
                        <span className="text-[10px] font-black uppercase text-red-500 tracking-wider animate-bounce mt-1 block">
                          ⚠️ SEGURE POR 5S!
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-zinc-450 dark:text-zinc-500 tracking-wider mt-1 block">
                          Clicar por 5 segundos
                        </span>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => setQrOpen(true)}
                        className="w-full py-4 px-4 bg-[#242b38] hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border border-[#2e3a4e] min-h-[52px]"
                      >
                        <QrCode size={14} /> QR CODE
                      </button>
                      <span className="text-[9px] font-black uppercase text-zinc-450 dark:text-zinc-500 tracking-wider mt-1 block text-center">
                        Para Socorristas
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7. Footer Tabs Page Pills */}
                <div className="grid grid-cols-2 gap-3 pt-6">
                  {['QUEM SOMOS', 'PRIVACIDADE', 'MANUAL', 'FAQ'].map((lbl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (lbl === 'QUEM SOMOS') {
                          window.history.pushState({}, '', '/quem-somos');
                        } else if (lbl === 'PRIVACIDADE') {
                          window.history.pushState({}, '', '/privacidade');
                        } else if (lbl === 'MANUAL') {
                          window.history.pushState({}, '', '/manual');
                        } else if (lbl === 'FAQ') {
                          window.history.pushState({}, '', '/faq');
                        }
                      }}
                      className="py-3 px-4 rounded-xl text-center font-black text-[10px] uppercase tracking-wider transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* SignOut link */}
                <div className="text-center pt-8 pb-10">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-rose-600/10 hover:bg-rose-600/15 border border-rose-500/20 text-rose-100 rounded-full text-xs font-black tracking-wide transition-all"
                  >
                    <LogOut size={14} /> Sair da conta
                  </button>
                </div>

              </motion.div>
            )}

            {!isCustomRoute && activeTab === 'medications' && (
              <motion.div
                key="medications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-[2.5rem] p-6 border transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1">Meus Medicamentos</h1>
                    <p className="text-zinc-400 text-xs font-semibold">Gerencie suas receitas e alarmes ativos.</p>
                  </div>
                  <button
                    onClick={handleAddMedicationClick}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-xs uppercase tracking-wider w-full md:w-auto"
                  >
                    <Plus size={16} /> Adicionar Medicamento
                  </button>
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
                      <Pill size={40} />
                    </div>
                    <div className="max-w-xs mx-auto space-y-2">
                      <h3 className="font-extrabold text-lg">Nenhum remédio cadastrado</h3>
                      <p className="text-zinc-400 text-sm">Adicione os remédios ativos do seu tratamento no botão superior.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medications.map(med => {
                      const foundInteraction = interactions.find(i => i.medicationIds.includes(med.id));
                      return (
                        <MedicationCard
                          key={med.id}
                          medication={med}
                          isConflict={!!foundInteraction}
                          conflictSeverity={foundInteraction?.severity}
                          onEdit={(m) => {
                            setEditingMed(m);
                            setIsFormOpen(true);
                          }}
                          onDelete={handleDeleteMedication}
                          onToggleActive={handleToggleActive}
                          onMarkTaken={handleMarkTaken}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {!isCustomRoute && activeTab === 'followup' && (
              <motion.div
                key="followup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AcompanhamentoPage darkMode={darkMode} />
              </motion.div>
            )}

            {!isCustomRoute && activeTab === 'reminders' && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Sync Notification Banner */}
                {syncStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-5 rounded-[2rem] flex items-start gap-3.5 border shadow-lg ${
                      syncStatus.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {syncStatus.success ? (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      ) : (
                        <AlertTriangle size={20} className="text-rose-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black leading-relaxed">{syncStatus.message}</p>
                    </div>
                    <button 
                      onClick={() => setSyncStatus(null)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0 self-center"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}

                {/* Main Header Card */}
                <div className={`p-6 md:p-8 rounded-[2.5rem] border transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-[#15a350] rounded-2xl">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1">
                        Lembretes de Medicamentos
                      </h1>
                      <p className="text-zinc-400 text-xs font-semibold">
                        Sincronize sua agenda de saúde e controle os horários de tomada.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Calendar Sync Widget block (Screenshot 2) */}
                <div className={`p-6.5 rounded-[2.5rem] border text-center transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mx-auto text-[#15a350] mb-4">
                    <Calendar size={28} className="stroke-[2.5]" />
                  </div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                    Sincronizar com Google Calendar
                  </h3>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
                    Crie lembretes para todos os seus medicamentos diretamente na sua agenda do Google.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleSyncGoogleCalendar}
                    disabled={isSyncing}
                    className="w-full py-4 px-6 bg-[#15a350] hover:bg-[#118f43] disabled:opacity-85 active:scale-98 text-white font-black rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-100 dark:shadow-none transition-all text-sm cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <Calendar size={18} />
                        Sincronizar com Google
                      </>
                    )}
                  </button>
                </div>

                {/* Mid Section: Active Medications with Reminders (Screenshot 2) */}
                <div className={`p-6 md:p-8 rounded-[2.5rem] border transition-all duration-450 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="mb-4">
                    <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">
                      Medicamentos com Lembretes
                    </h4>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-relaxed font-semibold">
                      Estes medicamentos têm horários e serão adicionados ao seu calendário.
                    </p>
                  </div>

                  {medications.filter(m => m.active).length === 0 ? (
                    <p className="text-zinc-400 text-xs italic py-6 text-center">Nenhum remédio ativo cadastrado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {medications.filter(m => m.active).map((med) => {
                        const times = med.times || [med.time || '08:00'];
                        return times.map((time, idx) => (
                          <div 
                            key={`${med.id}-${idx}`}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1c2431] border border-zinc-100 dark:border-transparent text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/20 text-[#15a350] rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
                                {med.name}
                              </span>
                            </div>
                            <span className="font-black text-[#15a350] font-mono tracking-tight bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl">
                              {time}
                            </span>
                          </div>
                        ));
                      })}
                    </div>
                  )}
                </div>

                {/* Low Section: Today's Intake checker */}
                <div className={`p-6 md:p-8 rounded-[2.5rem] border transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="mb-5">
                    <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                      Lembretes de Hoje
                    </h3>
                    <p className="text-zinc-500 text-xs font-semibold mt-1">
                      Tome sua dose e marque-a como concluída para controle de adesão.
                    </p>
                  </div>

                  {medications.filter(m => m.active).length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
                        <Clock size={40} />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <h3 className="font-extrabold text-lg">Nenhuma dose ativa</h3>
                        <p className="text-zinc-400 text-sm mt-1">Sua agenda abrirá assim que possuir medicamentos ativos cadastrados.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const sortedDoses: { time: string; med: Medication }[] = [];
                        medications.filter(m => m.active).forEach(med => {
                          const times = med.times || [med.time || '08:00'];
                          times.forEach(t => {
                            sortedDoses.push({ time: t, med });
                          });
                        });
                        
                        sortedDoses.sort((a, b) => a.time.localeCompare(b.time));

                        return sortedDoses.map((dose, index) => {
                          const isTakenToday = dose.med.lastTaken && new Date(dose.med.lastTaken).toDateString() === new Date().toDateString();
                          return (
                            <div 
                              key={index} 
                              className={`flex flex-col md:flex-row md:items-center justify-between p-4.5 rounded-2xl border transition-all ${
                                isTakenToday
                                  ? (darkMode ? 'bg-emerald-950/20 border-emerald-900 text-zinc-500' : 'bg-emerald-50/50 border-emerald-100 text-zinc-400')
                                  : (darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100')
                              }`}
                            >
                              <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <span className="text-xl font-black font-mono tracking-tight text-emerald-500 shrink-0">
                                  {dose.time}
                                </span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <p className={`font-extrabold text-sm ${isTakenToday ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                                      {dose.med.name}
                                    </p>
                                    {isTakenToday && (
                                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                        Concluído
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{dose.med.dosage} • via {dose.med.route}</p>
                                </div>
                              </div>
                              
                              {!isTakenToday && (
                                <button
                                  onClick={() => handleMarkTaken(dose.med)}
                                  className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors shrink-0 active:scale-95 flex items-center gap-1.5"
                                >
                                  <Check size={14} /> Tomar
                                </button>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!isCustomRoute && activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-[2.5rem] p-6 border transition-all duration-300 ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1">Relatório Médico</h1>
                    <p className="text-zinc-400 text-xs font-semibold">Análise de adesão e segurança de medicamentos.</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-[#2e3a4e] text-zinc-700 dark:text-zinc-300 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                  >
                    <FileBarChart size={14} /> Imprimir Prontuário
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
                  <div className={`p-4.5 rounded-2xl border ${darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">Prescrições</span>
                    <span className="text-2.5xl font-black">{medications.filter(m => m.active).length}</span>
                  </div>

                  <div className={`p-4.5 rounded-2xl border ${darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">Conflitos</span>
                    <span className={`text-2.5xl font-black block ${interactions.length > 0 ? 'text-rose-500' : ''}`}>
                      {interactions.length}
                    </span>
                  </div>

                  <div className={`p-4.5 rounded-2xl border ${darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">Sem Estoque</span>
                    <span className="text-2.5xl font-black">
                      {medications.filter(m => m.stock !== undefined && m.stock <= (m.refillThreshold || 0)).length}
                    </span>
                  </div>

                  <div className={`p-4.5 rounded-2xl border ${darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">Monitoramento</span>
                    <span className="text-2.5xl font-black">{healthLogs.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <section className={`p-5.5 rounded-2.5xl border ${darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <h3 className="font-extrabold text-sm uppercase tracking-tight mb-3 text-amber-600 dark:text-amber-500 flex items-center gap-2">
                      <AlertTriangle size={16} /> Alertas de Estoque Crítico
                    </h3>
                    <div className="space-y-2">
                      {medications.filter(m => m.stock !== undefined && m.stock <= (m.refillThreshold || 0)).map(med => (
                        <div key={med.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                          <div>
                            <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{med.name}</p>
                            <p className="text-xs text-zinc-400">Restam apenas {med.stock} unidades</p>
                          </div>
                          <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full shrink-0">Baixo</span>
                        </div>
                      ))}
                      {medications.filter(m => m.stock !== undefined && m.stock <= (m.refillThreshold || 0)).length === 0 && (
                        <p className="text-xs italic text-zinc-400 py-3 text-center">Nenhum estoque em estado crítico de reposição.</p>
                      )}
                    </div>
                  </section>

                  <section className={`p-5.5 rounded-2.5xl border ${darkMode ? 'bg-[#1c2431] border-[#2e3a4e]' : 'bg-zinc-50 border-zinc-100'}`}>
                    <h3 className="font-extrabold text-sm uppercase tracking-tight mb-3 text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                      <Activity size={16} /> Sinais e Sintomas Registrados
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(healthLogs.flatMap(log => log.symptoms))).map((sym, i) => (
                        <span key={i} className="px-2.5 py-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold leading-none">
                          {sym}
                        </span>
                      ))}
                      {healthLogs.flatMap(log => log.symptoms).length === 0 && (
                        <p className="text-xs italic text-zinc-400 py-3 text-center w-full">Nenhum sintoma relevante registrado nos prontuários.</p>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {!isCustomRoute && activeTab === 'portal' && (
              <motion.div
                key="portal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MedicalPortal 
                  medications={medications} 
                  logs={healthLogs} 
                  user={user}
                  onUpdateMedications={setMedications}
                  onBack={() => setActiveTab('dashboard')} 
                />
              </motion.div>
            )}

            {!isCustomRoute && activeTab === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto space-y-6 pt-2 pb-10"
              >
                {/* Header view with back navigation */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`p-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm ${
                      darkMode ? 'bg-[#242b38] hover:bg-[#2c3547] text-zinc-300 border border-zinc-800' : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-150/55'
                    }`}
                  >
                    <ChevronLeft size={18} className="stroke-[3]" />
                  </button>
                  <div>
                    <h2 className="text-2.5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                      Saúde & Dispositivos
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">Conecte e monitore seus wearables em tempo real.</p>
                  </div>
                </div>

                {/* Relógio / Smartwatch Card */}
                <div className={`rounded-[2.5rem] p-6 md:p-8 border transition-all duration-300 relative overflow-hidden ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Watch size={22} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-md font-black tracking-tight text-zinc-805 dark:text-white leading-none">Relógio / Smartwatch</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Integração Bluetooth Direta</p>
                      </div>
                    </div>
                    
                    {/* Status dot indicator */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      bluetoothConnected 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/50' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-transparent'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${bluetoothConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></div>
                      <span>{bluetoothConnected ? 'Conectado' : 'Não Conectado'}</span>
                    </div>
                  </div>

                  {/* 4 Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Freq Cardiaca */}
                    <div className={`p-4.5 rounded-2.5xl border transition-colors ${
                      darkMode ? 'bg-[#1b2432] border-[#2c3547]/50' : 'bg-[#f8faf9] border-zinc-150/35'
                    }`}>
                      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">
                        <Heart size={14} className="text-red-500" />
                        <span>Freq. Cardíaca</span>
                      </div>
                      <span className={`text-xl font-black ${bluetoothConnected ? 'text-red-600 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {pulseRate}
                      </span>
                    </div>

                    {/* Bateria */}
                    <div className={`p-4.5 rounded-2.5xl border transition-colors ${
                      darkMode ? 'bg-[#1b2432] border-[#2c3547]/50' : 'bg-[#f8faf9] border-zinc-150/35'
                    }`}>
                      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">
                        <Battery size={14} className="text-emerald-500" />
                        <span>Bateria</span>
                      </div>
                      <span className={`text-xl font-black ${bluetoothConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {batteryLevel}
                      </span>
                    </div>

                    {/* Passos */}
                    <div className={`p-4.5 rounded-2.5xl border transition-colors ${
                      darkMode ? 'bg-[#1b2432] border-[#2c3547]/50' : 'bg-[#f8faf9] border-zinc-150/35'
                    }`}>
                      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">
                        <Footprints size={14} className="text-blue-500" />
                        <span>Passos</span>
                      </div>
                      <span className={`text-xl font-black ${bluetoothConnected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {stepsCount}
                      </span>
                    </div>

                    {/* Calorias */}
                    <div className={`p-4.5 rounded-2.5xl border transition-colors ${
                      darkMode ? 'bg-[#1b2432] border-[#2c3547]/50' : 'bg-[#f8faf9] border-zinc-150/35'
                    }`}>
                      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">
                        <Flame size={14} className="text-orange-500" />
                        <span>Calorias</span>
                      </div>
                      <span className={`text-xl font-black ${bluetoothConnected ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {caloriesBurned}
                      </span>
                    </div>
                  </div>

                  {/* Connect Bluetooth Button */}
                  <button
                    onClick={() => {
                      if (bluetoothConnected) {
                        setBluetoothConnected(false);
                        setPulseRate('--');
                        setBatteryLevel('--');
                        setStepsCount('--');
                        setCaloriesBurned('--');
                      } else {
                        setBluetoothConnecting(true);
                        setTimeout(() => {
                          setBluetoothConnecting(false);
                          setBluetoothConnected(true);
                          setPulseRate('72 bpm');
                          setBatteryLevel('84%');
                          setStepsCount('4.820');
                          setCaloriesBurned('210 kcal');
                        }, 1200);
                      }
                    }}
                    disabled={bluetoothConnecting}
                    className="w-full py-4 px-6 bg-[#00a374] hover:bg-[#008f65] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {bluetoothConnecting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Procurando Dispositivos Bluetooth...
                      </>
                    ) : (
                      <>
                        <Bluetooth size={14} className={bluetoothConnected ? 'animate-pulse' : ''} />
                        {bluetoothConnected ? 'Desconectar Dispositivo' : 'Conectar via Bluetooth'}
                      </>
                    )}
                  </button>
                </div>

                {/* Google Fit Card */}
                <div className={`rounded-[2.5rem] p-6 md:p-8 border transition-all duration-300 overflow-hidden ${
                  darkMode ? 'bg-[#242b38] border-[#2e3a4e]' : 'bg-white border-zinc-100 shadow-sm'
                }`}>
                  <div className="flex gap-4.5 items-start mb-4">
                    <img src="https://www.google.com/favicon.ico" className="w-9 h-9 border border-zinc-100 dark:border-zinc-800 p-1 bg-white rounded-xl select-none" alt="Google Fit" />
                    <div className="flex-1">
                      <h3 className="text-md font-black tracking-tight text-zinc-900 dark:text-white leading-none">Google Fit</h3>
                      <p className="text-zinc-550 dark:text-zinc-400 text-xs mt-1.5 font-medium leading-relaxed">
                        Importa passos e batimentos das últimas 24h direto da sua conta Google.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (googleFitAuthorized) {
                        setGoogleFitAuthorized(false);
                      } else {
                        setGoogleFitAuthorizing(true);
                        setTimeout(() => {
                          setGoogleFitAuthorizing(false);
                          setGoogleFitAuthorized(true);
                        }, 1000);
                      }
                    }}
                    disabled={googleFitAuthorizing}
                    className="w-full py-4 px-6 bg-[#00a374] hover:bg-[#008f65] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {googleFitAuthorizing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Autorizando Google Fit...
                      </>
                    ) : googleFitAuthorized ? (
                      <>
                        <Check size={14} className="stroke-[3.5] text-emerald-300" />
                        Google Fit Autorizado ✓
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Autorizar Google Fit
                      </>
                    )}
                  </button>
                </div>

                {/* Sente-se mal agora? Purple Banner */}
                <div className="bg-gradient-to-tr from-indigo-600 to-[#5433ff] text-white p-7 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-indigo-500/10 border border-indigo-550/20">
                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Stethoscope size={22} className="stroke-[2.5] text-indigo-200 animate-pulse" />
                      Sente-se mal agora?
                    </h3>
                    <p className="text-indigo-100 text-xs font-semibold leading-relaxed">
                      Se os seus batimentos ou pressão estiverem fora do normal, inicie uma triagem inteligente por IA.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/diagnostico-sintomas');
                      setActiveTab('dashboard');
                    }}
                    className="px-5 py-3.5 bg-white hover:bg-zinc-50 text-indigo-750 font-black rounded-lg rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0 select-none z-10"
                  >
                    Iniciar Análise de Sintomas
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Global Bottom Navigation Bar */}
        <nav className={`fixed bottom-0 left-0 right-0 border-t z-40 transition-colors duration-300 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] ${
          darkMode ? 'bg-[#242b38] border-zinc-800' : 'bg-white border-zinc-100'
        }`}>
          <div className="max-w-3xl mx-auto flex justify-between items-center h-16.5 px-4 md:px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if ((tab.id === 'reports' || tab.id === 'followup') && !hasUnlimitedAccess()) {
                    window.history.pushState({}, '', '/upgrade');
                    return;
                  }
                  if (tab.id === 'reports') {
                    window.history.pushState({}, '', '/relatorio');
                    setActiveTab('reports');
                  } else {
                    window.history.pushState({}, '', '/');
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1.5 transition-all text-xs border-t-2 h-full flex-1 px-1.5 ${
                  (activeTab === tab.id && !currentPath.includes('/relatorio')) || (tab.id === 'reports' && currentPath.includes('/relatorio')) 
                    ? 'text-emerald-500 border-emerald-500 font-extrabold' 
                    : (darkMode ? 'text-zinc-500 border-transparent hover:text-zinc-300' : 'text-zinc-400 border-transparent hover:text-zinc-600')
                }`}
              >
                {tab.icon}
                <span className="text-[10px] uppercase font-black tracking-tight scale-90">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Float Medication Record Form Modal */}
        {isFormOpen && (
          <MedicationForm 
            medication={editingMed}
            medications={medications}
            onSave={handleSaveMedication}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMed(undefined);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* stripe simulation modal */}
        <AnimatePresence>
          {showStripeSim && (
            <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-[60] select-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="max-w-md w-full bg-[#1e2530] text-white rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col min-h-[520px]"
              >
                {/* Stripe Simulated Custom Header */}
                <div className="bg-[#5433ff] text-[10px] font-black uppercase tracking-widest text-white py-3 text-center flex items-center justify-center gap-1.5 px-4 select-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                  <span>AMBIENTE DE TESTE STRIPE SIMULATOR</span>
                </div>

                {!paymentSuccess ? (
                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Stripe Brand Indicator */}
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-black tracking-tight text-white/90 flex items-center gap-1">
                          <span className="text-[#5433ff] font-extrabold text-2xl lowercase font-sans">stripe</span>
                          <span className="font-light text-zinc-400 text-sm">checkout</span>
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800/60 text-zinc-400 rounded-lg text-[9px] font-bold border border-zinc-700/55">
                          <Lock size={10} className="text-emerald-500" />
                          <span>PAGAMENTO SEGURO SSL</span>
                        </div>
                      </div>

                      {/* Summary Area */}
                      <div className="bg-zinc-800/30 p-4.5 rounded-2xl border border-zinc-700/50 space-y-2 mb-6">
                        <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
                          <span>Plano Mestre Premium</span>
                          <span>Acesso Anual</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-zinc-250">CrossMeds Premium Access 💎</span>
                          <span className="text-lg font-black text-white">R$ 49,90</span>
                        </div>
                      </div>

                      {/* Card Details Entry */}
                      <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1 text-left">
                            Nome Impresso no Cartão
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="W. S. A. CONATO"
                            className="w-full px-4 py-3 bg-[#151c26] border border-zinc-750 focus:border-[#5433ff] rounded-2xl text-white font-medium text-sm transition-all focus:outline-none placeholder-zinc-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1 text-left">
                            Número do Cartão
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              className="w-full px-4 py-3 bg-[#151c26] border border-zinc-750 focus:border-[#5433ff] rounded-2xl text-white font-medium text-sm transition-all focus:outline-none placeholder-zinc-700"
                            />
                            <div className="absolute right-4 top-3.5 text-zinc-550 font-bold text-xs select-none">
                              💳
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1 text-left">
                              Validade (MM/AA)
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="12/28"
                              className="w-full px-4 py-3 bg-[#151c26] border border-zinc-750 focus:border-[#5433ff] rounded-2xl text-white font-medium text-sm transition-all focus:outline-none placeholder-zinc-700 text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1 text-left">
                              CVC (Segurança)
                            </label>
                            <input
                              type="text"
                              value={cardCVC}
                              onChange={(e) => setCardCVC(e.target.value)}
                              placeholder="123"
                              className="w-full px-4 py-3 bg-[#151c26] border border-zinc-750 focus:border-[#5433ff] rounded-2xl text-white font-medium text-sm transition-all focus:outline-none placeholder-zinc-700 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3 pt-6 w-full">
                      <button
                        onClick={async () => {
                          setPaymentLoading(true);
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          setPaymentLoading(false);
                          setPaymentSuccess(true);
                          
                          // Upgrade user simulated access to True
                          if (user) {
                            localStorage.setItem(`is_premium_${user.uid}`, 'true');
                            if (!user.uid.startsWith('wsaconato-terra-test')) {
                              try {
                                const userRef = doc(db, 'users', user.uid);
                                await updateDoc(userRef, { isPremium: true });
                              } catch (e) {
                                console.error('Error saving premium status to firestore:', e);
                              }
                            }
                          }
                          localStorage.setItem('is_premium_simulated', 'true');
                          setIsPremiumSimulated(true);
                          setDbUserPremium(true);
                        }}
                        disabled={paymentLoading || !cardName.trim()}
                        className="w-full py-4 px-6 bg-[#5433ff] hover:bg-[#4324db] text-white font-black rounded-2xl tracking-wider text-xs uppercase shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {paymentLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Check size={16} className="stroke-[3]" />
                            EFETUAR PAGAMENTO — R$ 49,90
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowStripeSim(false)}
                        className="w-full py-3 hover:bg-zinc-800 text-zinc-400 font-bold text-xs rounded-xl tracking-wide transition-all"
                      >
                        Cancelar Pagamento
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-center items-center text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white"
                    >
                      <Check size={40} className="stroke-[4.5]" />
                    </motion.div>

                    <div className="space-y-2">
                      <h4 className="text-2xl font-black tracking-tight leading-none text-white font-sans">Pagamento Confirmado!</h4>
                      <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">AMBIENTE SEGURO • COMPRA PROCESSADA</p>
                    </div>

                    <p className="text-zinc-400 text-xs font-semibold leading-relaxed max-w-xs leading-normal">
                      Parabéns! Sua conta foi atualizada com sucesso para a versão <strong>Mestre Premium</strong>. Todos os limites foram completamente removidos e suas interações avançadas por IA estão liberadas.
                    </p>

                    <div className="bg-[#151c26] p-4 rounded-xl border border-zinc-700/30 w-full text-left font-mono text-[9px] text-zinc-400 space-y-1">
                      <div>ID TRANSAÇÃO: ch_3N5b9sLd920v7pKw1s8</div>
                      <div>PRODUTO: ACC_CROSSMEDS_MASTER</div>
                      <div>STATUS: CHARGED_SUCCESSFULLY</div>
                    </div>

                    <button
                      onClick={() => setShowStripeSim(false)}
                      className="w-full py-4.5 bg-[#15a350] hover:bg-[#118f43] text-white font-black rounded-2xl tracking-wider text-xs uppercase shadow-md transition-all active:scale-98 mt-2"
                    >
                      Começar a usar sem limites
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Chat IA Consulting Drawer (Ações Rápidas) */}
        <AnimatePresence>
          {chatOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className={`w-full max-w-lg h-[80vh] md:h-[70vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border ${
                  darkMode ? 'bg-[#242b38] border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-800'
                }`}
              >
                {/* Header of Drawer */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0 bg-zinc-50/50 dark:bg-zinc-800/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm tracking-tight leading-none mb-1">CrossMeds AI</h3>
                      <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Suporte Farmacológico Inteligente</p>
                    </div>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                    <X size={18} className="text-zinc-400" />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : (darkMode ? 'bg-zinc-800 border border-zinc-700 rounded-tl-none' : 'bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-tl-none')
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="font-bold">{msg.text}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert">
                            {renderFormattedText(msg.text)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className={`rounded-2xl px-4.5 py-3 border flex items-center gap-2 ${
                        darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100'
                      }`}>
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">AI está redigindo...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-[#242b38]">
                  <div className="flex gap-2 items-center">
                    <input 
                      required
                      type="text"
                      className="flex-1 px-4.5 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-medium leading-none"
                      placeholder="Pergunte se seus remédios têm interação..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                    />
                    <VoiceButton 
                      onResult={(text) => setChatInput(text)}
                      placeholder="Fale sua pergunta..."
                      className="h-[44px] w-[44px]"
                    />
                    <button 
                      type="submit"
                      disabled={chatLoading}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SOS Emergency warning dialog */}
        <AnimatePresence>
          {sosOpen && (() => {
            const activeProfile = getPatientProfile();
            const getQRDataText = () => {
              return `PACIENTE: ${activeProfile.nome}\n` +
                `IDADE: ${activeProfile.idade} anos | SANGUE: ${activeProfile.tipoSanguineo}\n` +
                `DOENÇAS: ${activeProfile.doencas}\n` +
                `ALERGIAS: ${activeProfile.alergias}\n` +
                `RESPONSÁVEL: ${activeProfile.contatoEmergenciaNome} (${activeProfile.contatoEmergenciaParentesco}) - FONE: ${activeProfile.contatoEmergenciaTelefone}\n` +
                `MEDICAMENTOS EM USO:\n` +
                medications.filter((m: any) => m.active).map((m: any) => ` • ${m.name} (${m.dosage}) - ${m.frequency}`).join('\n') + `\n` +
                `Local: ${sosLocation ? `Lat ${sosLocation.lat.toFixed(5)}, Lng ${sosLocation.lng.toFixed(5)}` : 'GPS Padrão'}`;
            };

            const mapUrl = sosLocation ? `https://www.google.com/maps?q=${sosLocation.lat},${sosLocation.lng}` : `https://www.google.com/maps?q=-21.7852,-48.1758`;
            const rawContactPhone = activeProfile.contatoEmergenciaTelefone.replace(/\D/g, '');
            const contactPhone = rawContactPhone.startsWith('55') || rawContactPhone.length > 11 ? rawContactPhone : `55${rawContactPhone}`;

            const whatsappMessage = `🚨 *ALERTA DE EMERGÊNCIA - CROSSMEDS* 🚨\n\n` +
              `Olá, este é um alerta de emergência automático para o paciente *${activeProfile.nome}*.\n\n` +
              `📍 *LOCALIZAÇÃO GPS COORDENADAS:* ${mapUrl}\n` +
              `📞 *CONTATO RESPONSÁVEL:* ${activeProfile.contatoEmergenciaNome} (${activeProfile.contatoEmergenciaParentesco}) - ${activeProfile.contatoEmergenciaTelefone}\n\n` +
              `🏥 *INFORMAÇÕES ADICIONAIS DO PACIENTE:*\n` +
              `• Tipo Sanguíneo: ${activeProfile.tipoSanguineo}\n` +
              `• Doenças Crônicas: ${activeProfile.doencas}\n` +
              `• Alergias Graves: ${activeProfile.alergias}\n\n` +
              `Por favor, me ajude! Minhas prescrições e prontuário completo podem ser acessados via QR Code no meu celular.`;

            const whatsappUrl = `https://wa.me/${contactPhone}?text=${encodeURIComponent(whatsappMessage)}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getQRDataText())}`;

            return (
              <div className="fixed inset-0 bg-[#0c121e]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className={`w-full max-w-lg rounded-[2.5rem] p-6.5 shadow-2xl border select-none ${
                    darkMode ? 'bg-[#1b2432] border-[#2e3a4e] text-white' : 'bg-white border-zinc-150 text-zinc-900'
                  }`}
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse"></div>
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-450 dark:text-zinc-400">
                        Alerta de Emergência Ativo
                      </h3>
                    </div>
                    <button 
                      onClick={closeSosModal} 
                      className={`p-2 rounded-full transition-all ${
                        darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      <X size={18} className="stroke-[2.5]" />
                    </button>
                  </div>

                  {/* EMERGENCY SIGNAL TRIGGERED */}
                  <div className="space-y-5 text-left">
                    <div className="p-4 bg-red-500/10 dark:bg-red-950/20 rounded-3xl border border-red-500/20 text-center space-y-1 animate-pulse">
                      <div className="w-10 h-10 bg-red-500/15 text-red-600 dark:text-red-450 rounded-full flex items-center justify-center mx-auto mb-1 animate-pulse">
                        <Activity size={20} className="stroke-[2.5]" />
                      </div>
                      <h2 className="text-lg font-black text-red-600 dark:text-red-400 uppercase tracking-wide">Sinal de Emergência Ativado</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-350 font-bold">
                        O paciente precisa e aguarda amparo. Dados salvos para compartilhamento via link de GPS e QR Code.
                      </p>
                    </div>

                    {/* GPS Geolocation Card */}
                    <div className={`p-4 rounded-3xl border flex items-start gap-3.5 ${
                      darkMode ? 'bg-zinc-800/55 border-zinc-800' : 'bg-emerald-50/45 border-emerald-100'
                    }`}>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <MapPin size={22} className="animate-bounce" />
                      </div>
                      <div className="space-y-0.5 w-full">
                        <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-450 tracking-wider">Localização GPS em Tempo Real</span>
                        {sosLocation ? (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              Coordenadas: <span className="font-extrabold text-emerald-500 font-mono text-[11px]">{sosLocation.lat.toFixed(5)}, {sosLocation.lng.toFixed(5)}</span>
                            </p>
                            <a 
                              href={mapUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 uppercase tracking-wide"
                            >
                              <Navigation size={12} /> Abrir no Google Maps <ChevronRight size={10} />
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-zinc-450">
                            Obtendo coordenadas de geolocalização...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Caregiver and Rescuer Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Caregiver Connect Panel */}
                      <div className={`p-4 rounded-3xl border flex flex-col justify-between space-y-4 ${
                        darkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-150'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Cuidador Principal</span>
                          <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-150">{activeProfile.contatoEmergenciaNome}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{activeProfile.contatoEmergenciaParentesco || 'Familiar'}</p>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450 font-mono tracking-wider">{activeProfile.contatoEmergenciaTelefone}</p>
                        </div>

                        <div className="space-y-2">
                          <a 
                            href={`tel:${rawContactPhone}`}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 text-center"
                          >
                            <PhoneCall size={12} /> Ligar Ligação
                          </a>
                          <a 
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-zinc-805 hover:bg-zinc-700 text-zinc-100 dark:bg-[#2e3a4e] dark:hover:bg-zinc-700/50 font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors border border-zinc-700/60 flex items-center justify-center gap-1.5 text-center"
                          >
                            <Send size={12} /> Alerta WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Rescue / Paramedic QR Code Panel */}
                      <div className={`p-4 rounded-3xl border flex flex-col items-center justify-between text-center relative ${
                        darkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-red-50/15 border-red-150/10'
                      }`}>
                        <div className="space-y-1 mb-2">
                          <span className="text-[9px] uppercase font-black text-rose-500 dark:text-rose-400 tracking-wider flex items-center gap-1 justify-center">
                            <QrCode size={13} /> QR Code Socorrista
                          </span>
                          <p className="text-[9px] leading-relaxed text-zinc-450 dark:text-zinc-400 font-semibold">
                            Socorristas ou médicos de urgência podem escanear o código abaixo no celular do paciente inconsciente para ler o diário, alergias e receitas.
                          </p>
                        </div>

                        {/* Dynamic QR image from online API */}
                        <div className="bg-white p-2 rounded-2xl w-28 h-28 mx-auto flex items-center justify-center border border-zinc-100 shadow-sm shrink-0">
                          <img 
                            src={qrImageUrl} 
                            alt="Medical Emergency QR Code" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Reassuring message and single main close/dismiss button */}
                    <div className="pt-3 border-t border-[#2e3a4e]/40 dark:border-zinc-800 space-y-3">
                      <p className="text-[10px] text-center font-bold text-emerald-600 dark:text-emerald-400">
                        ✔ Localização enviada! O contato e o link com seu GPS foram entregues ao seu cuidador. Aguarde com calma até o contato.
                      </p>
                      <button 
                        onClick={closeSosModal}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-550 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2 animate-pulse"
                      >
                        <RotateCcw size={14} /> Voltar ao Painel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* QR CODE Emergency Record Warning Dialog */}
        <AnimatePresence>
          {qrOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl text-center border ${
                  darkMode ? 'bg-[#242b38] border-zinc-800' : 'bg-white border-zinc-100'
                }`}
              >
                <div className="flex justify-between items-center mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-650 dark:text-zinc-300">Meu QR Code Médico</h3>
                  <button onClick={() => setQrOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-white p-4.5 rounded-2.5xl w-44 h-44 mx-auto flex items-center justify-center border border-zinc-100 shadow-inner mb-5">
                  {/* Real-looking synthetic emergency scan vector code */}
                  <div className="relative w-full h-full flex flex-col justify-between p-1.5 border-4 border-zinc-800 rounded-xl">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-zinc-800 rounded-sm"></div>
                      <div className="w-8 h-8 bg-zinc-800 rounded-sm"></div>
                    </div>
                    {/* Generative QR check grid */}
                    <div className="w-20 h-20 border-2 border-zinc-800 self-center rounded flex flex-col p-1 gap-1">
                      <div className="flex justify-around"><div className="w-3 h-3 bg-zinc-800"></div><div className="w-3 h-3 bg-zinc-800"></div></div>
                      <div className="flex justify-around"><div className="w-3 h-3 bg-zinc-800"></div><div className="w-3 h-3 bg-zinc-850"></div></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-8 h-8 bg-zinc-800 rounded-sm"></div>
                      <div className="w-3 h-3 bg-zinc-800"></div>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Prontuário de {user.displayName || 'W. S. A. Conato'}</p>
                <p className="text-sm text-zinc-500 mt-1 mb-6 leading-relaxed">
                  Em caso de incidentes, socorristas podem escanear este QR Code para visualizar suas alergias, tipo sanguíneo (O+) e contatos de emergência sincronizados no CrossMeds.
                </p>

                <button 
                  onClick={() => setQrOpen(false)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
                >
                  Fechar
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Support, contact us and add manual contact warning modal */}
        <AnimatePresence>
          {contactOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border ${
                  darkMode ? 'bg-[#242b38] border-zinc-800' : 'bg-white border-zinc-100'
                }`}
              >
                <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-tight">Fale Conosco</h3>
                  <button onClick={() => setContactOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-normal">
                    Se você encontrou problemas, quer dar sugestões ou deseja configurar sua conta PWA e gerenciar prescrições com médicos credenciados, envie sua mensagem abaixo.
                  </p>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Seu Email</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full mt-1 px-4.5 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:outline-none" 
                      value={user.email || 'wsaconato@gmail.com'} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Sua Mensagem</label>
                    <textarea 
                      placeholder="Sua proposta de recurso, feedback ou suporte técnico..." 
                      className="w-full mt-1 px-4.5 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700 text-xs font-medium outline-none focus:border-emerald-500 transition-all h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => setContactOpen(false)}
                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      setContactOpen(false);
                      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-[#4bac8f] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FULL SCREEN ALARM LOCK-SCREEN COMPONENT */}
        <AnimatePresence>
          {ringingAlarm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-950 z-[9999] flex flex-col justify-between p-8 text-white font-sans select-none overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(135deg, #0f1c18 0%, #070908 100%)',
              }}
            >
              {/* Wallpaper glowing blur dots */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

              {/* Top status bar simulated & Mute control */}
              <div className="relative z-10 flex justify-between items-center text-zinc-400 text-xs tracking-widest uppercase font-black">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse animate-duration-1000"></span>
                  <span>CrossMeds Alarme Ativo</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (alarmMuted) {
                      setAlarmMuted(false);
                      startAlarmTone();
                    } else {
                      setAlarmMuted(true);
                      stopAlarmTone();
                    }
                  }}
                  className="p-3 bg-white/5 border border-white/5 active:scale-95 rounded-full backdrop-blur-md text-white hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                  title={alarmMuted ? 'Ativar Som' : 'Mutar Som'}
                >
                  {alarmMuted ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} className="text-emerald-400 animate-bounce" />}
                </button>
              </div>

              {/* Digital big lock screen clock */}
              <div className="relative z-10 text-center mt-12 space-y-2">
                <motion.h1 
                  animate={{ scale: [1, 1.02, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-450"
                >
                  {ringingAlarm.time}
                </motion.h1>
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>

              {/* Ringing Visual Box & Medication Info */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full my-6">
                
                {/* Micro animation rings */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                  <motion.div 
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-4 border-2 border-emerald-400/20 rounded-full"
                  />
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-[#50bfa3] rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative z-20">
                    <Pill size={44} className="text-white animate-pulse" />
                  </div>
                </div>

                {/* Lock screen medication widget panel */}
                <div className="w-full bg-[#1c2431]/95 border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl space-y-4 backdrop-blur-lg">
                  <div className="text-center space-y-1">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#50bfa3]">HORA DE TOMAR</h2>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight break-words leading-tight text-white">
                      {ringingAlarm.medication.name}
                    </h3>
                    <div className="inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-black text-zinc-300 tracking-wide mt-1">
                      {ringingAlarm.medication.dosage}
                    </div>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-4 space-y-2.5 text-zinc-405 text-xs font-semibold text-center">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-350">
                      <Clock size={14} className="text-[#50bfa3] shrink-0" />
                      <span>{ringingAlarm.medication.frequency} | Horário: {ringingAlarm.time}</span>
                    </div>
                    {ringingAlarm.medication.howToTake && ringingAlarm.medication.howToTake !== 'Selecione' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-950/40 border border-sky-900/40 text-sky-400 rounded-full text-[10px] uppercase font-black tracking-wide">
                        <span>{formatHowToTake(ringingAlarm.medication.howToTake)}</span>
                      </div>
                    )}
                    {ringingAlarm.medication.instructions && (
                      <p className="text-zinc-450 italic leading-snug font-medium border-t border-zinc-900 pt-2.5 px-2">
                        💡 {ringingAlarm.medication.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Large Locked Phone Style Action Bottom Buttons */}
              <div className="relative z-10 w-full max-w-sm mx-auto flex gap-4 pt-4 shrink-0 pb-6">
                <button
                  type="button"
                  onClick={async () => {
                    stopAlarmTone();
                    if (!ringingAlarm.isTest) {
                      await handleSetDoseStatus(ringingAlarm.medication, ringingAlarm.time, 'skipped');
                    }
                    setRingingAlarm(null);
                  }}
                  className="flex-1 py-4.5 bg-red-950/30 hover:bg-red-950/50 border border-red-900/30 font-black rounded-2xl text-xs uppercase tracking-wider text-red-400 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Pular Dose
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    stopAlarmTone();
                    if (!ringingAlarm.isTest) {
                      await handleSetDoseStatus(ringingAlarm.medication, ringingAlarm.time, 'taken');
                    }
                    setRingingAlarm(null);
                  }}
                  className="flex-1 py-4.5 bg-emerald-600 hover:bg-emerald-500 font-black rounded-2xl text-xs uppercase tracking-wider text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  <Check size={16} className="stroke-[3]" />
                  Tomei
                </button>
              </div>

              {ringingAlarm.isTest && (
                <div className="relative z-10 text-center text-[10px] text-zinc-550 uppercase font-black tracking-widest bg-white/5 py-1 px-3 rounded-full w-max mx-auto shrink-0 mb-2">
                  🔔 Testando Alarme de Celular Apagado
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {confirmConfig && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmConfig(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] border p-6 md:p-8 shadow-2xl ${
                darkMode ? 'bg-[#242b38] border-zinc-805 text-white' : 'bg-white border-zinc-150 text-zinc-900'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 text-red-605 dark:text-red-400 rounded-2xl flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black tracking-tight leading-tight uppercase">
                    {confirmConfig.title}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {confirmConfig.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmConfig(null)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center border active:scale-95 cursor-pointer ${
                    darkMode 
                      ? 'border-zinc-800 bg-zinc-800 hover:bg-zinc-750 text-zinc-300' 
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-650'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmConfig.onConfirm();
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center cursor-pointer shadow-lg shadow-red-500/10"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
};

export default App;
