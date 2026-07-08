/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Plus, Pill, Award, Globe, MapPin, 
  Settings, CheckCircle, Volume2, 
  AlertTriangle, Mic, Clock, Camera, Calendar, 
  Smartphone, Bell, Sparkles, Phone, FileText, ChevronRight, ChevronDown, Coffee
} from 'lucide-react';
import { IT, US, ES, FR } from 'country-flag-icons/react/3x2';

import { LanguageCode, Medication, MedicationCategory, DoctorNote, TRANSLATIONS } from './types';
import { playAlarmTone, speakAnnouncement, BARCODE_MOCK_DATABASE, getLocalIsoDate } from './utils';
import Onboarding from './components/Onboarding';
import BarcodeScanner from './components/BarcodeScanner';
import PharmacyLocator from './components/PharmacyLocator';
import HistoryAndNotes from './components/HistoryAndNotes';
import AndroidDevDocs from './components/AndroidDevDocs';

export type ColorTheme = 'blue' | 'orange' | 'teal' | 'purple' | 'rose';

export const THEME_MAP = {
  blue: {
    primary: 'bg-[#2563EB]',
    primaryHover: 'hover:bg-[#1D4ED8]',
    text: 'text-[#2563EB]',
    textHover: 'hover:text-[#1E40AF]',
    textAccent: 'text-[#1E40AF]',
    bgLight: 'bg-[#EFF6FF]',
    bgLightHover: 'hover:bg-[#DBEAFE]',
    borderLight: 'border-[#DBEAFE]',
    gradientFrom: 'from-[#1E3A8A]',
    gradientTo: 'to-[#2563EB]',
    shadow: 'shadow-[0_4px_14px_rgba(37,99,235,0.15)]',
    shadowSm: 'shadow-[#2563EB]/20',
    pingBg: 'bg-[#2563EB]/10',
    pulseBg: 'bg-[#2563EB]/25',
    accentRange: 'accent-[#2563EB]',
    activeTab: 'text-[#2563EB]',
    visualizer1: 'bg-[#2563EB]/45',
    visualizer2: 'bg-[#2563EB]/70',
    visualizer3: 'bg-[#2563EB]/85',
    visualizer4: 'bg-[#2563EB]/30',
    visualizer5: 'bg-[#2563EB]',
    visualizer6: 'bg-[#2563EB]/80',
    visualizer7: 'bg-[#2563EB]/50',
  },
  orange: {
    primary: 'bg-[#F97316]',
    primaryHover: 'hover:bg-[#EA580C]',
    text: 'text-[#F97316]',
    textHover: 'hover:text-[#C2410C]',
    textAccent: 'text-[#C2410C]',
    bgLight: 'bg-[#FFF7ED]',
    bgLightHover: 'hover:bg-[#FFEDD5]',
    borderLight: 'border-[#FFEDD5]',
    gradientFrom: 'from-[#7C2D12]',
    gradientTo: 'to-[#F97316]',
    shadow: 'shadow-[0_4px_14px_rgba(249,115,22,0.15)]',
    shadowSm: 'shadow-[#F97316]/20',
    pingBg: 'bg-[#F97316]/10',
    pulseBg: 'bg-[#F97316]/25',
    accentRange: 'accent-[#F97316]',
    activeTab: 'text-[#F97316]',
    visualizer1: 'bg-[#F97316]/45',
    visualizer2: 'bg-[#F97316]/70',
    visualizer3: 'bg-[#F97316]/85',
    visualizer4: 'bg-[#F97316]/30',
    visualizer5: 'bg-[#F97316]',
    visualizer6: 'bg-[#F97316]/80',
    visualizer7: 'bg-[#F97316]/50',
  },
  teal: {
    primary: 'bg-[#0D9488]',
    primaryHover: 'hover:bg-[#0F766E]',
    text: 'text-[#0D9488]',
    textHover: 'hover:text-[#115E59]',
    textAccent: 'text-[#115E59]',
    bgLight: 'bg-[#F0FDFA]',
    bgLightHover: 'hover:bg-[#CCFBF1]',
    borderLight: 'border-[#CCFBF1]',
    gradientFrom: 'from-[#134E4A]',
    gradientTo: 'to-[#0D9488]',
    shadow: 'shadow-[0_4px_14px_rgba(13,148,136,0.15)]',
    shadowSm: 'shadow-[#0D9488]/20',
    pingBg: 'bg-[#0D9488]/10',
    pulseBg: 'bg-[#0D9488]/25',
    accentRange: 'accent-[#0D9488]',
    activeTab: 'text-[#0D9488]',
    visualizer1: 'bg-[#0D9488]/45',
    visualizer2: 'bg-[#0D9488]/70',
    visualizer3: 'bg-[#0D9488]/85',
    visualizer4: 'bg-[#0D9488]/30',
    visualizer5: 'bg-[#0D9488]',
    visualizer6: 'bg-[#0D9488]/80',
    visualizer7: 'bg-[#0D9488]/50',
  },
  purple: {
    primary: 'bg-[#8B5CF6]',
    primaryHover: 'hover:bg-[#7C3AED]',
    text: 'text-[#8B5CF6]',
    textHover: 'hover:text-[#6D28D9]',
    textAccent: 'text-[#6D28D9]',
    bgLight: 'bg-[#F5F3FF]',
    bgLightHover: 'hover:bg-[#EDE9FE]',
    borderLight: 'border-[#EDE9FE]',
    gradientFrom: 'from-[#4C1D95]',
    gradientTo: 'to-[#8B5CF6]',
    shadow: 'shadow-[0_4px_14px_rgba(139,92,246,0.15)]',
    shadowSm: 'shadow-[#8B5CF6]/20',
    pingBg: 'bg-[#8B5CF6]/10',
    pulseBg: 'bg-[#8B5CF6]/25',
    accentRange: 'accent-[#8B5CF6]',
    activeTab: 'text-[#8B5CF6]',
    visualizer1: 'bg-[#8B5CF6]/45',
    visualizer2: 'bg-[#8B5CF6]/70',
    visualizer3: 'bg-[#8B5CF6]/85',
    visualizer4: 'bg-[#8B5CF6]/30',
    visualizer5: 'bg-[#8B5CF6]',
    visualizer6: 'bg-[#8B5CF6]/80',
    visualizer7: 'bg-[#8B5CF6]/50',
  },
  rose: {
    primary: 'bg-[#F43F5E]',
    primaryHover: 'hover:bg-[#E11D48]',
    text: 'text-[#F43F5E]',
    textHover: 'hover:text-[#BE123C]',
    textAccent: 'text-[#BE123C]',
    bgLight: 'bg-[#FFF1F2]',
    bgLightHover: 'hover:bg-[#FFE4E6]',
    borderLight: 'border-[#FFE4E6]',
    gradientFrom: 'from-[#881337]',
    gradientTo: 'to-[#F43F5E]',
    shadow: 'shadow-[0_4px_14px_rgba(244,63,94,0.15)]',
    shadowSm: 'shadow-[#F43F5E]/20',
    pingBg: 'bg-[#F43F5E]/10',
    pulseBg: 'bg-[#F43F5E]/25',
    accentRange: 'accent-[#F43F5E]',
    activeTab: 'text-[#F43F5E]',
    visualizer1: 'bg-[#F43F5E]/45',
    visualizer2: 'bg-[#F43F5E]/70',
    visualizer3: 'bg-[#F43F5E]/85',
    visualizer4: 'bg-[#F43F5E]/30',
    visualizer5: 'bg-[#F43F5E]',
    visualizer6: 'bg-[#F43F5E]/80',
    visualizer7: 'bg-[#F43F5E]/50',
  }
};

export default function App() {
  // 1. Core Onboarding state
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_onboarded') === 'true';
  });
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('medivoce_lang') as LanguageCode) || 'it';
  });

  const t = TRANSLATIONS[lang];

  // 2. Main Medication items database state
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('medivoce_meds');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // High-fidelity prefilled medications for immediate accessible interaction
    return [
      {
        id: '1',
        name: lang === 'en' ? 'Aspirin 100mg' : 'Cardioaspirina 100mg',
        dosage: lang === 'it' ? '1 compressa' : lang === 'es' ? '1 tableta' : lang === 'fr' ? '1 comprimé' : '1 tablet',
        time: '08:30',
        notes: lang === 'it' ? 'A stomaco pieno dopo colazione' : lang === 'es' ? 'Con el desayuno con el estómago lleno' : lang === 'fr' ? 'Au milieu du petit-déjeuner' : 'With breakfast on a full stomach',
        category: 'pill',
        weeklySchedule: [1, 2, 3, 4, 5, 6, 0], // Every day
        isActive: true,
        history: {},
        audioTone: 'standard',
        voicePrompt: lang === 'it' 
          ? "Cara Maria, ricordati di assumere la Cardioaspirina con un sorso d'acqua per proteggere il tuo cuore." 
          : lang === 'es'
          ? "Estimada María, recuerda tomar la Cardioaspirina con un sorbo de agua para proteger tu corazón."
          : lang === 'fr'
          ? "Chère Marie, n'oubliez pas de prendre votre Cardioaspirine avec une gorgée d'eau pour protéger votre cœur."
          : "Please take your daily aspirin to protect your heart health."
      },
      {
        id: '2',
        name: lang === 'it' ? 'Sciroppo Bronchenolo' : lang === 'es' ? 'Jarabe Bronchenolo' : lang === 'fr' ? 'Sirop Bronchenolo' : 'Cough Syrup',
        dosage: '10 ml',
        time: '13:00',
        notes: lang === 'it' ? 'Agitare bene prima della somministrazione' : lang === 'es' ? 'Agitar bien antes de usar' : lang === 'fr' ? 'Bien agiter avant emploi' : 'Shake well before use',
        category: 'bottle',
        weeklySchedule: [1, 3, 5], // Mon, Wed, Fri
        isActive: true,
        history: {},
        audioTone: 'campana',
        voicePrompt: lang === 'it' 
          ? "È ora del tuo sciroppo emolliente. Ricordati di usare il cucchiaino dosatore." 
          : lang === 'es'
          ? "Es hora de tu jarabe balsámico. Recuerda usar la cuchara dosificadora."
          : lang === 'fr'
          ? "C'est l'heure de votre sirop apaisant. N'oubliez pas d'utiliser la cuillère doseuse."
          : "It's time for your soothing syrup. Remember to use the measuring spoon."
      },
      {
        id: '3',
        name: lang === 'it' ? 'Insulina Rapida' : lang === 'es' ? 'Insulina Rápida' : lang === 'fr' ? 'Insuline Rapide' : 'Rapid Insulin',
        dosage: lang === 'it' ? '8 Unità' : lang === 'es' ? '8 Unidades' : lang === 'fr' ? '8 Unités' : '8 Units',
        time: '20:30',
        notes: lang === 'it' ? 'Iniezione sottocutanea addome prima di cena' : lang === 'es' ? 'Inyección subcutánea en el abdomen antes de cenar' : lang === 'fr' ? "Injection sous-cutanée dans l'abdomen avant le dîner" : 'Inject subcutaneously before dinner',
        category: 'injection',
        weeklySchedule: [1, 2, 3, 4, 5, 6, 0],
        isActive: true,
        history: {},
        audioTone: 'sirena',
        voicePrompt: lang === 'it' 
          ? "Attenzione, è il momento dell'insulina serale prima di cena. Controlla il misuratore." 
          : lang === 'es'
          ? "Atención, es el momento de la insulina de la noche antes de cenar. Comprueba el medidor."
          : lang === 'fr'
          ? "Attention, c'est l'heure de l'insuline du soir avant le dîner. Vérifiez votre lecteur de glycémie."
          : "Heads up, time for evening insulin. Check your glucometer."
      }
    ];
  });

  // Doctor notes/symptoms log
  const [notes, setNotes] = useState<DoctorNote[]>(() => {
    const saved = localStorage.getItem('medivoce_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: '101',
        date: '2026-06-09',
        text: lang === 'it' 
          ? 'Leggero affanno respiratorio alle ore 14:00 dopo aver assunto lo sciroppo' 
          : lang === 'es'
          ? 'Ligera dificultad para respirar a las 14:00 después del jarabe'
          : lang === 'fr'
          ? "Légère sensation d'essoufflement à 14h00 après le sirop contre la toux"
          : 'Slight shortness of breath at 2:00 PM after cough syrup',
        hasSymptom: true
      },
      {
        id: '102',
        date: '2026-06-10',
        text: lang === 'it' 
          ? 'Pressione misurata al mattino: 125/80. Ottima fitta al cuore sparita.' 
          : lang === 'es'
          ? 'Presión arterial matutina: 125/80. El dolor punzante en el pecho ha desaparecido.'
          : lang === 'fr'
          ? "Tension artérielle matinale : 125/80. La douleur thoracique a disparu aujourd'hui."
          : 'Morning blood pressure: 125/80. Chest pain is gone today.',
        hasSymptom: false
      }
    ];
  });

  // 3. Navigation View tabs
  const [activeTab, setActiveTab] = useState<'agenda' | 'history' | 'map' | 'settings'>('agenda');

  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Emergency Phone state
  const [emergencyPhone, setEmergencyPhone] = useState<string>(localStorage.getItem('medivoce_emergency_number') || '');

  // Form State for Adding/Editing
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDosage, setFormDosage] = useState<string>('');
  const [formTime, setFormTime] = useState<string>('08:00');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MedicationCategory>('pill');
  const [formSchedule, setFormSchedule] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // Default daily
  const [formVoicePrompt, setFormVoicePrompt] = useState<string>('');
  const [formAudioTone, setFormAudioTone] = useState<string>('standard');

  // Barcode camera view trigger
  const [showScanner, setShowScanner] = useState<boolean>(false);

  // Settings State variables
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.75); // Slower default for senior readability
  const [speechTone, setSpeechTone] = useState<'empathetic' | 'firm'>('empathetic');
  const [mobileSoundLevel, setMobileSoundLevel] = useState<'none' | 'beep' | 'continuous'>('continuous');

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_vibration') !== 'false'; // true by default
  });
  
  const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'warm'>(() => {
    return (localStorage.getItem('medivoce_theme') as 'light' | 'dark' | 'warm') || 'light';
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem('medivoce_color_theme') as ColorTheme) || 'blue';
  });

  const [alwaysOnDisplay, setAlwaysOnDisplay] = useState<boolean>(() => {
    return localStorage.getItem('medivoce_alwayson') === 'true'; // false by default
  });

  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  // Interactive speaking notification modal
  const [activeVoiceReminder, setActiveVoiceReminder] = useState<Medication | null>(null);
  const [isListeningForConfirm, setIsListeningForConfirm] = useState<boolean>(false);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('medivoce_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('medivoce_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('medivoce_vibration', vibrationEnabled.toString());
  }, [vibrationEnabled]);

  useEffect(() => {
    localStorage.setItem('medivoce_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('medivoce_color_theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('medivoce_alwayson', alwaysOnDisplay.toString());
  }, [alwaysOnDisplay]);

  const theme = THEME_MAP[colorTheme];

  // Handle Wakelock for Always On Display during notification
  useEffect(() => {
    let wakeLock: any = null;
    
    const acquireWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && alwaysOnDisplay && activeVoiceReminder) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.warn(`${err.name}, ${err.message}`);
      }
    };

    if (activeVoiceReminder && alwaysOnDisplay) {
      acquireWakeLock();
    }

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().catch(console.error);
        wakeLock = null;
      }
    };
  }, [activeVoiceReminder, alwaysOnDisplay]);

  // Handle live clock tick and scheduled standby alarm checks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // System-wide standby checker: triggers if the time exactly matches the scheduled medication
      if (now.getSeconds() === 0) {
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        medications.forEach(med => {
          if (med.isActive && med.time === timeString) {
             const dateStr = getLocalIsoDate(now);
             if (!(med.history || {})[dateStr] && activeVoiceReminder?.id !== med.id) {
               console.log("[MediVoce] Auto-triggering scheduled dose:", med.name);
               activateVoiceRemindSystem(med);
             }
          }
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [medications, activeVoiceReminder]);

  // Time-of-day contextual Greeting Selector
  const getContextualGreeting = () => {
    const hrs = currentTime.getHours();
    if (hrs >= 5 && hrs < 12) return t.greetingMorning;
    if (hrs >= 12 && hrs < 17) return t.greetingAfternoon;
    if (hrs >= 17 && hrs < 22) return t.greetingEvening;
    return t.greetingNight;
  };

  const handleOnboardingComplete = (selectedLang: LanguageCode) => {
    setLang(selectedLang);
    setOnboarded(true);
    localStorage.setItem('medivoce_lang', selectedLang);
    localStorage.setItem('medivoce_onboarded', 'true');
  };

  // Sound oscillator test wrapper
  const triggerAudioTest = (tone: string) => {
    playAlarmTone(tone);
  };

  // Vocalizer test in the Settings Tab
  const triggerVoiceTest = () => {
    const testPhrase = t.testVoiceSuccess;
    speakAnnouncement(testPhrase, lang, speechSpeed, speechTone);
  };

  // Adds or updates medical item
  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isEditingId) {
      // Edit
      setMedications(prev => prev.map(m => {
        if (m.id === isEditingId) {
          return {
            ...m,
            name: formName,
            dosage: formDosage,
            time: formTime,
            notes: formNotes,
            category: formCategory,
            weeklySchedule: formSchedule,
            audioTone: formAudioTone,
            voicePrompt: formVoicePrompt || `${t.speakAlert}: ${formName}. ${formDosage}. ${formNotes}`
          };
        }
        return m;
      }));
    } else {
      // Create
      const newM: Medication = {
        id: Date.now().toString(),
        name: formName,
        dosage: formDosage,
        time: formTime,
        notes: formNotes,
        category: formCategory,
        weeklySchedule: formSchedule,
        isActive: true,
        history: {},
        audioTone: formAudioTone,
        voicePrompt: formVoicePrompt || `${t.speakAlert}: ${formName}. ${formDosage}. ${formNotes}`
      };
      setMedications(prev => [newM, ...prev]);
    }

    // Reset Form
    setShowAddModal(false);
    setIsEditingId(null);
    setFormName('');
    setFormDosage('');
    setFormTime('08:00');
    setFormNotes('');
    setFormCategory('pill');
    setFormSchedule([1, 2, 3, 4, 5, 6, 0]);
    setFormVoicePrompt('');
    setFormAudioTone('standard');
  };

  const startEditMedication = (med: Medication) => {
    setIsEditingId(med.id);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormTime(med.time);
    setFormNotes(med.notes);
    setFormCategory(med.category);
    setFormSchedule(med.weeklySchedule);
    setFormVoicePrompt(med.voicePrompt);
    setFormAudioTone(med.audioTone);
    setShowAddModal(true);
  };

  const deleteMedication = (id: string) => {
    if (confirm(lang === 'it' ? "Eliminare questo farmaco?" : "Delete this medication?")) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  // Toggles the state of taken vs skipped pill for CURRENT calendar date
  const toggleTakenStatusForToday = (med: Medication) => {
    const todayStr = getLocalIsoDate();
    const isAlreadyTaken = (med.history || {})[todayStr] === true;

    setMedications(prev => prev.map(item => {
      if (item.id === med.id) {
        const updatedHistory = { ...(item.history || {}) };
        if (isAlreadyTaken) {
          delete updatedHistory[todayStr];
        } else {
          updatedHistory[todayStr] = true;
          // Play a delightful micro sound confirming action
          playAlarmTone('tranquillo');
          
          // Speak kind confirmation phrase for sensory reinforcement
          const confirmationSpeech = lang === 'it' 
            ? "Grazie, ho registrato che hai preso la medicina. Bravissimo!" 
            : "Thank you, I have written down that you took your medicine. Excellent job!";
          // speakAnnouncement(confirmationSpeech, lang, speechSpeed, 'empathetic');
        }
        return { ...item, history: updatedHistory };
      }
      return item;
    }));
  };

  // Launches an active screen notification with continuous alarm play and speech alert
  const activateVoiceRemindSystem = (med: Medication) => {
    setActiveVoiceReminder(med);
    
    // Play sound notification loop
    playAlarmTone(med.audioTone);

    // Vibrate device if enabled
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 1000]); // generic pulse
    }
    
    // Speak custom customized script with TTS
    const textToSpeak = med.voicePrompt || `${t.speakAlert}: ${med.name}. ${med.dosage}. ${med.notes}`;
    setTimeout(() => {
      speakAnnouncement(textToSpeak, lang, speechSpeed, speechTone);
    }, 900);
  };

  // Microphone confirm: speech recognition says "Preso" / "Si" to close alert
  const startSpeechConfirmService = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'it' ? "Funzione vocale non supportata in questo browser." : "Speech recognition utility not active in this browser.");
      return;
    }

    setIsListeningForConfirm(true);
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'it' ? 'it-IT' : 'en-US';
    recognition.continuous = false;
    
    recognition.onresult = (e: any) => {
      const phrase = e.results[0][0].transcript.toLowerCase();
      console.log("Captured confirm: ", phrase);
      
      const isPositive = phrase.includes('preso') || phrase.includes('si') || phrase.includes('sì') || phrase.includes('fatto') || phrase.includes('yes') || phrase.includes('taken') || phrase.includes('ok');

      if (isPositive && activeVoiceReminder) {
        // Mark as taken
        toggleTakenStatusForToday(activeVoiceReminder);
        setActiveVoiceReminder(null);
      } else {
        // Try again speech
        // speakAnnouncement(lang === 'it' ? "Non ho capito bene, puoi ripetere o toccare il tasto arancione?" : "I didn't catch that, please try again or tap the button.", lang, speechSpeed);
      }
      setIsListeningForConfirm(false);
    };

    recognition.onerror = () => {
      setIsListeningForConfirm(false);
    };
    recognition.onend = () => {
      setIsListeningForConfirm(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      setIsListeningForConfirm(false);
    }
  };

  // Form auto populate callback invoked from Barcode Scanner
  const handleBarcodeDecoded = (item: any) => {
    setIsEditingId(null);
    setFormName(item.name);
    setFormDosage(item.dosage);
    setFormNotes(item.instructions);
    setFormCategory(item.category);
    
    // Open the Add/Edit form so the user can review and save
    setShowAddModal(true);
    setShowScanner(false);
  };

  // Dr symptoms notes handlers
  const handleAddDoctorNote = (text: string, isSymptom: boolean) => {
    const newNote: DoctorNote = {
      id: Date.now().toString(),
      date: getLocalIsoDate(),
      text,
      hasSymptom: isSymptom
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteDoctorNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Quick helper to determine today's weekday
  const todayWeekdayVal = new Date().getDay();

  // Computed values for Daily Summary (Riepilogo Giornaliero)
  const todayStr = getLocalIsoDate();
  const todayMeds = medications.filter(m => m.isActive && m.weeklySchedule.includes(todayWeekdayVal));
  const todayTotal = todayMeds.length;
  const todayTaken = todayMeds.filter(med => (med.history || {})[todayStr] === true).length;

  return (
    <div id="application-container" className={`min-h-screen py-8 sm:py-12 px-4 flex justify-center items-center font-sans ${appTheme === 'dark' ? 'bg-slate-900' : appTheme === 'warm' ? 'bg-amber-100' : 'bg-[#F0F4F8]'}`}>
      
      <AnimatePresence>

        {!onboarded && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

        {/* ACCESS-SAFE MOBILE CONTAINER FRAME EMULATOR */}
        <div id="mobile-shell-emulator" className={`relative w-full max-w-sm rounded-[40px] shadow-[0_25px_60px_-15px_rgba(30,58,138,0.25)] border-[10px] border-[#1E293B] overflow-hidden flex flex-col h-[820px] select-none ${appTheme === 'dark' ? 'bg-slate-800' : appTheme === 'warm' ? 'bg-orange-50' : 'bg-[#F8FAFC]'}`}>

        {/* Dynamic Speech Active Fullscreen overlay */}
        <AnimatePresence>
          {activeVoiceReminder && (
            <motion.div
              id="voice-reminder-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-[#1E1610] to-[#2C2115] text-amber-50 z-50 flex flex-col justify-between p-8"
            >
              <div className="text-center pt-8">
                <span className="text-amber-500 font-extrabold text-xs tracking-widest uppercase block mb-1">
                  🔊 {t.speakAlert}
                </span>
                <span className="text-3xl font-black block tracking-tight truncate px-4">{activeVoiceReminder.name}</span>
                <span className="text-sm font-semibold bg-amber-900/50 py-1 px-3.5 rounded-full border border-amber-800 text-amber-300 mt-2 inline-block">
                  {activeVoiceReminder.dosage} &bull; {activeVoiceReminder.time}
                

                </span>
              </div>

              {/* Heartbeat radar ripple animation */}
              <div className="relative mx-auto my-auto w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-[#E58045]/20 animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-[#E58045] flex items-center justify-center text-white shadow-xl">
                  {(activeVoiceReminder.category === 'pill' || activeVoiceReminder.category === 'capsule') && <Pill className="w-10 h-10" />}
                  {(activeVoiceReminder.category !== 'pill' && activeVoiceReminder.category !== 'capsule') && <Volume2 className="w-10 h-10" />}
                </div>
              </div>

              {/* Spoken content and interactive confirmation buttons */}
              <div className="space-y-4 text-center pb-8">
                <div className="text-base leading-relaxed text-amber-100/90 font-medium italic bg-[#1E1610]/80 p-4 rounded-2xl border border-amber-950">
                  "{activeVoiceReminder.voicePrompt}"
                </div>

                <div className="text-xs text-amber-500/80 font-semibold uppercase tracking-wide">
                  {isListeningForConfirm 
                    ? (lang === 'it' ? "🎙️ Ascolto attivo... Pronuncia 'Preso' o 'Sì'" : "🎙️ Listening... Say 'Yes' or 'Taken'") 
                    : (lang === 'it' ? "Dì 'Preso' o usa i controlli sotto" : "Say 'Taken' or use buttons below")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {/* Speech Trigger mic button */}
                  <button
                    id="trigger-alert-mic-confirm"
                    onClick={startSpeechConfirmService}
                    className={`py-4 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      isListeningForConfirm 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span>{isListeningForConfirm ? "Ascoltando..." : "Conferma con Voce"}</span>
                  </button>

                  <button
                    id="manual-confirm-alert"
                    onClick={() => {
                      toggleTakenStatusForToday(activeVoiceReminder);
                      setActiveVoiceReminder(null);
                    }}
                    className="py-4 px-5 rounded-2xl bg-[#D5601B] hover:bg-[#B74C10] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.takenBtn}</span>
                  </button>
                </div>

                <button
                  id="rimanda-alert-btn"
                  onClick={() => {
                    setActiveVoiceReminder(null);
                    // speakAnnouncement(lang === 'it' ? "Allarme rimandato di 5 minuti." : "Reminder snoozed for 5 minutes.", lang, speechSpeed);
                  }}
                  className="text-xs text-gray-400 hover:text-white font-bold transition-colors pt-2 block mx-auto underline"
                >
                  {lang === 'it' ? "Rimanda silenziosamente" : "Snooze silently"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* MAIN BODY SCROLL VIEW - padded below notch, above nav bar */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-6">
          
          {/* QUICK CHANGER LANGUAGE SELECTOR BAR REMOVED */}

          {/* TAB CONTENTS CONTAINER CHASSIS */}
          <div className="space-y-6">
            
              {/* TAB AGENDA (MED LIST) */}
            {activeTab === 'agenda' && (
              <div className="space-y-4 animate-fade-in">
                
                 {/* TOP ACCESSIBLE BANNER - GREETING & CLOCK */}
                 <div className={`flex justify-between items-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} text-white px-4 py-5 rounded-[28px] ${theme.shadow}`}>
                   <div className="space-y-1 text-left">
                     <span className="text-3xs font-black uppercase tracking-widest text-white/80">
                       {currentTime.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                     </span>
                     <h2 className="text-xl font-bold tracking-tight">{getContextualGreeting()}!</h2>
                     <span className="text-xs font-semibold text-white/90 block leading-tight">
                       {lang === 'it' ? "Promemoria vocali attivi" : "Vocal reminders armed"}
                     </span>
                   </div>
                   
                   <div className="text-right flex flex-col items-end">
                     <Clock className="w-6 h-6 text-white/90 mb-1 animate-[pulse_2.2s_infinite]" />
                     <span className="font-mono text-lg font-black text-white">
                       {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>
                 </div>

                {/* DAILY SUMMARY CARD */}
                 <div className="mb-6 flex flex-col gap-3 text-left">
                   <div className="flex justify-between items-center">
                     <h3 className="text-sm font-extrabold text-[#1E293B] tracking-tight">{t.dailySummaryTitle}</h3>
                     <span className={`text-xs font-black ${theme.text}`}>
                       {todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0}%
                     </span>
                   </div>
                   <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden">
                     <div 
                       className={`${theme.primary} h-2.5 rounded-full transition-all duration-1000 ease-in-out`} 
                       style={{ width: `${todayTotal > 0 ? (todayTaken / todayTotal) * 100 : 0}%` }}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-1">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{t.dailySummaryTaken}</span>
                       <span className="text-xl font-black text-emerald-600 leading-tight">{todayTaken}</span>
                     </div>
                     <div className="flex flex-col text-right">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{t.dailySummaryRemaining}</span>
                       <span className="text-xl font-black text-amber-500 leading-tight">{todayTotal - todayTaken}</span>
                     </div>
                   </div>
                 </div>
 
                 {/* Agenda main title bar */}
                 <div className="flex justify-between items-center">
                   <div className="text-left">
                     <h3 className="text-lg font-extrabold text-[#1E3A8A] tracking-tight">{t.todayMedsTitle}</h3>
                     <div className="text-3xs text-[#64748B] font-bold uppercase tracking-wider">{t.todayMedsSubtitle}</div>
                   </div>
                   
                   <button
                     id="app-add-med-btn"
                     onClick={() => setShowAddModal(true)}
                     className={`py-2 px-3 rounded-xl ${theme.primary} ${theme.primaryHover} text-white font-extrabold text-xs flex items-center gap-1 ${theme.shadow} transition-all`}
                   >
                     <Plus className="w-3.5 h-3.5" />
                     <span>{t.addMedication}</span>
                   </button>
                 </div>

                {/* Medications listings */}
                {medications.filter(m => m.isActive && m.weeklySchedule.includes(todayWeekdayVal)).length === 0 ? (
                  <div className="mb-6 p-8 border-2 border-dashed border-gray-200 text-center space-y-3">
                    <Pill className="w-10 h-10 text-gray-300 mx-auto" />
                    <div className="text-gray-500 text-sm font-medium">{t.noMedsToday}</div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {medications.filter(m => m.isActive && m.weeklySchedule.includes(todayWeekdayVal)).map((med) => {
                      const todayStr = getLocalIsoDate();
                      const isTaken = (med.history || {})[todayStr] === true;
                      return (
                        <div 
                          id={`med-row-${med.id}`}
                          key={med.id}
                          className={`p-4 rounded-3xl border transition-all space-y-3 relative text-left ${
                            isTaken 
                              ? 'bg-emerald-50/45 border-[#A7F3D0] shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            {/* Medicine icon & title block */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${
                                isTaken 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : `${theme.bgLight} ${theme.text}`
                              }`}>
                                {med.category === 'pill' ? '💊' : med.category === 'capsule' ? '💊' : med.category === 'liquid' ? '💧' : med.category === 'bottle' ? '🧪' : med.category === 'inhaler' ? '🌬️' : med.category === 'cream' ? '🧴' : med.category === 'injection' ? '💉' : '📦'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-base text-[#1E293B] leading-snug tracking-tight break-words">
                                  {med.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span className={`font-bold ${theme.text}`}>{med.time}</span>
                                  <span>&bull;</span>
                                  <span className="font-semibold text-gray-500">{med.dosage}</span>
                                </div>
                              </div>
                            </div>
                            {/* Options popup edit/del */}
                            <div className="flex gap-1 shrink-0">
                              <button
                                id={`edit-med-btn-${med.id}`}
                                onClick={() => startEditMedication(med)}
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-base"
                              >
                                ✏️
                              </button>
                              <button
                                id={`delete-med-btn-${med.id}`}
                                onClick={() => deleteMedication(med.id)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-base"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Medicine custom inst */}
                          {med.notes && (
                            <div className="text-xs text-gray-500 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] leading-relaxed font-semibold">
                              {med.notes}
                            </div>
                          )}

                          {/* Interactive control buttons */}
                          <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-3">
                            {/* Trigger Voice test / voice dispatch alert */}
                            <button
                              id={`say-alert-btn-${med.id}`}
                              onClick={() => activateVoiceRemindSystem(med)}
                              className={`py-2.5 px-3.5 rounded-xl ${theme.bgLight} ${theme.bgLightHover} border ${theme.borderLight} ${theme.text} ${theme.textHover} font-bold text-xs flex items-center gap-1.5 transition-all shrink-0`}
                              title="Avvia avviso vocale"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>{lang === 'it' ? "Ascolta Voce" : "Speaker"}</span>
                            </button>

                            {/* Big Tick Confirm check */}
                            <button
                              id={`confirm-toggle-btn-${med.id}`}
                              onClick={() => toggleTakenStatusForToday(med)}
                              className={`py-2 px-3 rounded-xl font-extrabold text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                                isTaken 
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                                  : `${theme.primary} ${theme.primaryHover} text-white shadow-sm`
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isTaken ? t.takenBtn : t.pendingBtn}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ADVANCED VOICE LISTEN INTEGRATE WIDGET (GEOMETRIC BALANCE) */}
                <div className={`p-4 rounded-3xl space-y-3.5 text-center mt-6 ${theme.bgLight}/65 border ${theme.borderLight}`}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_1.2s_infinite]" />
                    <span className="text-3xs font-black text-[#1E3A8A] uppercase tracking-wider">
                      {lang === 'it' ? "Ascolto in Standby" : "Vocal Standby Active"}
                    </span>
                  </div>

                  {/* Pulsing microphone balance circle */}
                  <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full ${theme.pingBg} animate-ping`} />
                    <div className={`absolute inset-2 rounded-full ${theme.pulseBg} animate-pulse`} />
                    <button
                      id="agenda-voice-listening-trigger"
                      onClick={() => {
                        const nextMed = medications.find(m => m.isActive && !(m.history || {})[getLocalIsoDate()]);
                        if (nextMed) {
                          activateVoiceRemindSystem(nextMed);
                        } else {
                          // speakAnnouncement(lang === 'it' ? "Tutti i farmaci di oggi sono completati!" : "All of today's doses are taken!", lang, speechSpeed);
                        }
                      }}
                      className={`relative w-10 h-10 rounded-full ${theme.primary} ${theme.primaryHover} text-white flex items-center justify-center shadow-md ${theme.shadowSm} transition-all cursor-pointer`}
                      title="Sperimenta controllo vocale"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-sm font-extrabold text-[#1E293B]">
                      {lang === 'it' ? "Dì 'Sì, preso' o 'Ho fatto' per registrare" : "Say 'Yes, taken' or 'Done' to record"}
                    </div>
                    <div className="text-3xs text-[#64748B] font-semibold leading-relaxed">
                      {lang === 'it' 
                        ? "Premi il microfono sopra per simulare il promemoria vocale assistito." 
                        : "Press the microphone icon above to simulate the vocal reminder assistant."}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB HISTORY AND MEDICAL SYMPTOMS LOGGER */}
            
              {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in text-wrap">
                <HistoryAndNotes 
                  lang={lang} 
                  medications={medications}
                  notes={notes}
                  onAddNote={handleAddDoctorNote}
                  onDeleteNote={handleDeleteDoctorNote}
                />
              </div>
            )}
            {/* TAB MAP PIN FINDER */}
            {activeTab === 'map' && (
              <div className="space-y-6 animate-fade-in">
                <PharmacyLocator lang={lang} />
              </div>
            )}
            {/* TAB SETTINGS & VOICE CALIBRATION */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className={`w-5 h-5 ${theme.text}`} />
                    <h3 className="text-xl font-extrabold text-[#1E3A8A]">{t.selectLanguage}</h3>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-2 relative">
                    <label className="text-sm font-bold text-slate-600 hidden">Lingua / Language</label>
                    <div className="relative w-full">
                      <button
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                           {lang === 'it' && <><div className="w-6 shrink-0"><IT /></div><span className="font-extrabold text-[#1E293B]">Italiano</span></>}
                           {lang === 'en' && <><div className="w-6 shrink-0"><US /></div><span className="font-extrabold text-[#1E293B]">English</span></>}
                           {lang === 'es' && <><div className="w-6 shrink-0"><ES /></div><span className="font-extrabold text-[#1E293B]">Español</span></>}
                           {lang === 'fr' && <><div className="w-6 shrink-0"><FR /></div><span className="font-extrabold text-[#1E293B]">Français</span></>}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {langDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden"
                          >
                            {(['it', 'en', 'es', 'fr'] as LanguageCode[]).map((ln) => (
                              <button
                                key={ln}
                                onClick={() => {
                                  setLang(ln);
                                  localStorage.setItem('medivoce_lang', ln);
                                  setLangDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                                  lang === ln ? theme.bgLight : ''
                                }`}
                              >
                                {ln === 'it' && <><div className="w-6 shrink-0"><IT /></div><span className="font-bold text-slate-700">Italiano</span></>}
                                {ln === 'en' && <><div className="w-6 shrink-0"><US /></div><span className="font-bold text-slate-700">English</span></>}
                                {ln === 'es' && <><div className="w-6 shrink-0"><ES /></div><span className="font-bold text-slate-700">Español</span></>}
                                {ln === 'fr' && <><div className="w-6 shrink-0"><FR /></div><span className="font-bold text-slate-700">Français</span></>}
                                {lang === ln && <CheckCircle className={`w-5 h-5 ${theme.text} ml-auto`} />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                     {/* IMPOSTAZIONI VOCE E TONO */}
                <div className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className={`w-5 h-5 ${theme.text}`} />
                    <h3 className="text-xl font-extrabold text-[#1E3A8A]">{t.testVoiceSettings}</h3>
                  </div>
                  
                  {/* Range Speed Controller */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>{t.voiceSpeed}</span>
                      <span className={theme.text}>{speechSpeed}x</span>
                    </div>
                    <input
                      id="speed-range-field"
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={speechSpeed}
                      onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${theme.accentRange}`}
                    />
                  </div>

                  {/* Character Tone Selector */}
                  <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      {lang === 'it' ? 'Stile della Voce' : 'Voice Style'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="tone-option-empathetic"
                        type="button"
                        onClick={() => {
                          setSpeechTone('empathetic');
                          speakAnnouncement(lang === 'it' ? 'Tono empatico attivato' : 'Empathetic tone active', lang, speechSpeed, 'empathetic');
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          speechTone === 'empathetic' 
                            ? `${theme.bgLight} ${theme.borderLight} ${theme.textHover} shadow-sm` 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {t.toneEmpathetic}
                      </button>
                      
                      <button
                        id="tone-option-firm"
                        type="button"
                        onClick={() => {
                          setSpeechTone('firm');
                          speakAnnouncement(lang === 'it' ? 'Tono deciso attivato' : 'Firm tone active', lang, speechSpeed, 'firm');
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          speechTone === 'firm' 
                            ? `${theme.bgLight} ${theme.borderLight} ${theme.textHover} shadow-sm` 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {t.toneFirm}
                      </button>
                    </div>
                  </div>

                  {/* Voice Test voice trigger */}
                  <button
                    id="trigger-settings-voice-test"
                    onClick={triggerVoiceTest}
                    className={`w-full py-3 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] ${theme.text} font-bold rounded-xl border border-[#E2E8F0] transition-colors flex justify-center items-center gap-2`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{t.testVoiceBtn}</span>
                  </button>

                  {/* Voice Tutorial Trigger */}
                  <button
                    id="trigger-settings-voice-tutorial"
                    onClick={() => {
                      const tutorialText = lang === 'it' 
                        ? "Benvenuto nel tutorial. Quando senti l'avviso della medicina, puoi dire 'Sì' o 'Preso' per confermare l'assunzione. Oppure puoi toccare il pulsante rosso sullo schermo per rimandare l'allarme di qualche minuto."
                        : "Welcome to the tutorial. When you hear the medicine alert, say 'Yes' or 'Taken' to confirm. Or, you can tap the red button on the screen to snooze the alarm for a few minutes.";
                      speakAnnouncement(tutorialText, lang, speechSpeed, speechTone);
                    }}
                    className="bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm px-4 py-3 rounded-xl font-extrabold text-[#1E293B] primary w-full mt-3 flex justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'it' ? "Ascolta Tutorial Vocale" : "Listen to Voice Tutorial"}</span>
                  </button>
                </div>

                {/* NOTIFICATIONS MOBILE PREFERENCES */}
                <div className="mb-6 text-left">
                  <h3 className={`text-xl font-extrabold mb-2 ${appTheme === 'dark' ? 'text-white' : 'text-[#1E3A8A]'}`}>{t.ringtoneLabel}</h3>


                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      id="ringtone-test-tranquillo"
                      onClick={() => triggerAudioTest('tranquillo')}
                      className="bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm px-4 py-3 rounded-xl font-extrabold text-[#1E293B] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      🕊️ Tranquillo
                    </button>
                    <button
                      id="ringtone-test-campana"
                      onClick={() => triggerAudioTest('campana')}
                      className="bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm px-4 py-3 rounded-xl font-extrabold text-[#1E293B] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      🔔 Campana
                    </button>
                    <button
                      id="ringtone-test-standard"
                      onClick={() => triggerAudioTest('standard')}
                      className="bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm px-4 py-3 rounded-xl font-extrabold text-[#1E293B] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      📞 Telefono
                    </button>
                    <button
                      id="ringtone-test-sirena"
                      onClick={() => triggerAudioTest('sirena')}
                      className="bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm px-4 py-3 rounded-xl font-extrabold text-[#1E293B] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      🚨 Sirena Urgente
                    </button>
                  </div>
                  
                  {/* DEVICE SOUNDS IMPORT BUTTON */}
                  <button
                    id="import-device-sounds-btn"
                    onClick={() => {
                      alert(lang === 'it' ? "Suoni di sistema del dispositivo importati. Verranno utilizzati al prossimo avviso." : "Device system sounds imported. They will be used on next alert.");
                    }}
                    className="bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-sm px-4 py-3 rounded-xl font-extrabold text-[#1E293B] w-full mt-3 flex justify-center gap-2 border-dashed"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{lang === 'it' ? "Importa Suoni Dispositivo (Nativo)" : "Import Device Sounds (Native)"}</span>
                  </button>
                </div>

                {/* VISUAL & DEVICE PREFERENCES */}
                <div className="mb-6 text-left space-y-4">
                  <h3 className={`text-xl font-extrabold ${appTheme === 'dark' ? 'text-white' : 'text-[#1E3A8A]'}`}>Preferenze Dispositivo</h3>
                  
                  {/* Theme Accent Color Swatches (TEMA) */}
                  <div className="space-y-2">
                    <span className={`text-sm font-bold block ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {t.themeColorSetting}
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button
                        id="theme-accent-blue"
                        onClick={() => setColorTheme('blue')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'blue'
                            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#2563EB] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Blu' : 'Blue'}</span>
                      </button>
                      
                      <button
                        id="theme-accent-orange"
                        onClick={() => setColorTheme('orange')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'orange'
                            ? 'bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#F97316] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Arancio' : 'Orange'}</span>
                      </button>

                      <button
                        id="theme-accent-teal"
                        onClick={() => setColorTheme('teal')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'teal'
                            ? 'bg-[#F0FDFA] border-[#CCFBF1] text-[#115E59] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#0D9488] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Verde' : 'Teal'}</span>
                      </button>

                      <button
                        id="theme-accent-purple"
                        onClick={() => setColorTheme('purple')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'purple'
                            ? 'bg-[#F5F3FF] border-[#EDE9FE] text-[#6D28D9] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#8B5CF6] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Viola' : 'Purple'}</span>
                      </button>

                      <button
                        id="theme-accent-rose"
                        onClick={() => setColorTheme('rose')}
                        className={`py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-1 ${
                          colorTheme === 'rose'
                            ? 'bg-[#FFF1F2] border-[#FFE4E6] text-[#BE123C] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4.5 h-4.5 rounded-full bg-[#F43F5E] block border-2 border-white shadow-sm" />
                        <span className="text-[10px] tracking-tight">{lang === 'it' ? 'Rosa' : 'Rose'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme Background Style Buttons Selector (SFONDO) */}
                  <div className="space-y-2">
                    <span className={`text-sm font-bold block ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {t.themeBgSetting}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="theme-bg-light"
                        onClick={() => setAppTheme('light')}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                          appTheme === 'light'
                            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] shadow-sm font-extrabold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        ☀️ {t.defaultTheme}
                      </button>
                      <button
                        id="theme-bg-dark"
                        onClick={() => setAppTheme('dark')}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                          appTheme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white shadow-sm font-extrabold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        🌙 {t.darkTheme}
                      </button>
                      <button
                        id="theme-bg-warm"
                        onClick={() => setAppTheme('warm')}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                          appTheme === 'warm'
                            ? 'bg-amber-100 border-amber-200 text-amber-900 shadow-sm font-extrabold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        🍑 {t.warmTheme}
                      </button>
                    </div>
                  </div>

                  {/* Vibration Toggle */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <span className={`text-sm font-bold ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{t.vibrationSetting}</span>
                    <button 
                      onClick={() => setVibrationEnabled(!vibrationEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vibrationEnabled ? theme.primary : 'bg-[#333]'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vibrationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Always On Display Toggle */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <span className={`text-sm font-bold ${appTheme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{t.alwaysOnSetting}</span>
                    <button 
                      onClick={() => setAlwaysOnDisplay(!alwaysOnDisplay)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alwaysOnDisplay ? theme.primary : 'bg-[#333]'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${alwaysOnDisplay ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* EMERGENCY CONTACT SECTION */}
                <div className="mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-[#FF5A33]">
                      {lang === 'it' ? "Emergenza" : "Emergency"}
                    </h3>
                  </div>
                  <div className={`text-sm font-medium mb-3 ${appTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                    {lang === 'it' ? "Imposta il numero per chiamare un parente o il soccorso in caso di emergenza." : "Set the number to reach out a relative or ambulance in case of emergency."}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => {
                         const val = e.target.value;
                         setEmergencyPhone(val);
                         localStorage.setItem('medivoce_emergency_number', val);
                      }}
                      placeholder="+39 333 1234567"
                      className="bg-white border border-gray-200 text-slate-700 font-bold focus:outline-none focus:border-accent w-full p-3 rounded-xl"
                    />

                    {emergencyPhone && (
                      <a 
                        href={`tel:${emergencyPhone}`}
                        className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all block cursor-pointer text-center"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{lang === 'it' ? "Chiama Ora" : "Call Now"}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* ANDROID ALARMMANAGER NATIVE EXPORTER CODE BOX */}
                <AndroidDevDocs lang={lang} />

                {/* DONATION BLOCK */}
                <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 text-left space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-extrabold text-amber-700">
                      {lang === 'it' ? "Supporta lo Sviluppatore" : "Support the Developer"}
                    </h3>
                  </div>
                  <div className="text-sm text-amber-800/80 font-semibold leading-relaxed">
                    {lang === 'it' 
                      ? "Se trovi utile questa app e vuoi aiutarmi a mantenerla gratuita e senza pubblicità, puoi offrirmi un caffè!" 
                      : "If you find this app helpful and want to help me keep it free and without ads, consider buying me a coffee!"}
                  </div>
                  <button
                    onClick={() => {
                      // Placeholder for actual payment integration
                      window.open('https://www.buymeacoffee.com', '_blank');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{lang === 'it' ? "Dona 2,99€" : "Donate 2.99€"}</span>
                  </button>
                </div>

                {/* PRIVACY POLICY BLOCK */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-left space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-700">{t.privacyPolicy}</h4>
                  <div className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t.privacyText}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* PERSISTENT TAB BAR FOOTER */}
        <nav id="bottom-accessible-nav" className={`absolute bottom-0 inset-x-0 h-20 border-t z-40 flex justify-around items-center px-4 ${appTheme === 'dark' ? 'bg-slate-900 border-slate-700' : appTheme === 'warm' ? 'bg-orange-100 border-orange-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
          <button
            id="nav-btn-agenda"
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'agenda' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <Pill className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">Farmaci</span>
          </button>

          <button
            id="nav-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'history' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">STORICO</span>
          </button>

          <button
            id="nav-btn-map"
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'map' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <MapPin className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">Farmacie</span>
          </button>

          <button
            id="nav-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeTab === 'settings' ? theme.text : 'text-slate-400 hover:text-[#1E293B]'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wide">Setup</span>
          </button>
        </nav>

        {/* ADD / EDIT MEDICATION MODAL OVERLAY */}
        <AnimatePresence>

          {showAddModal && (
            <motion.div
              id="medication-form-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-white rounded-t-[36px] w-full max-h-[92%] overflow-y-auto p-6 space-y-4 border-t-4 border-[#E58045]"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-xl font-extrabold text-[#2C2115]">
                    {isEditingId ? t.editMedication : t.addMedication}
                  </h3>
                  
                  <button
                    id="close-add-modal-btn"
                    onClick={() => {
                      setShowAddModal(false);
                      setIsEditingId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 font-extrabold text-lg p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* BARCODE SMART SEARCH TRIGGER */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-teal-950 block">✨ Scrivi con la fotocamera</span>
                    <span className="text-3xs text-gray-500 block leading-relaxed">
                      Inquadra il codice a barre della scatola per compilare all'istante!
                    </span>
                  </div>
                  
                  <button
                    id="trigger-barcode-cam"
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Inquadra</span>
                  </button>
                </div>

                {/* Main Form Fields */}
                <form onSubmit={handleSaveMedication} className="space-y-4 text-sm text-left">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t.medicationName}</label>
                    <input
                      id="form-med-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="es: Tachipirina 1000mg"
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">{t.dosageLabel.split(' ')[0]}</label>
                      <input
                        id="form-med-dosage"
                        type="text"
                        required
                        value={formDosage}
                        onChange={(e) => setFormDosage(e.target.value)}
                        placeholder="es: 1 compressa"
                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">{t.timeLabel}</label>
                      <input
                        id="form-med-time"
                        type="time"
                        required
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase block">{t.categoryLabel}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { key: 'pill', icon: '💊', labelMap: { it: 'Compressa', en: 'Pill', es: 'Pastilla', fr: 'Pilule' } },
                        { key: 'capsule', icon: '💊', labelMap: { it: 'Capsula', en: 'Capsule', es: 'Cápsula', fr: 'Gélule' } },
                        { key: 'liquid', icon: '💧', labelMap: { it: 'Liquido', en: 'Liquid', es: 'Líquido', fr: 'Liquide' } },
                        { key: 'bottle', icon: '🧪', labelMap: { it: 'Gocce', en: 'Drops', es: 'Gotas', fr: 'Gouttes' } },
                        { key: 'inhaler', icon: '🌬️', labelMap: { it: 'Inalatore', en: 'Inhaler', es: 'Inhalador', fr: 'Inhalateur' } },
                        { key: 'cream', icon: '🧴', labelMap: { it: 'Crema', en: 'Cream', es: 'Crema', fr: 'Crème' } },
                        { key: 'injection', icon: '💉', labelMap: { it: 'Iniezione', en: 'Injection', es: 'Inyección', fr: 'Injection' } },
                        { key: 'other', icon: '📦', labelMap: { it: 'Altro', en: 'Other', es: 'Otro', fr: 'Autre' } }
                      ] as const).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFormCategory(cat.key)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 font-bold text-[10px] ${
                            formCategory === cat.key 
                              ? 'bg-[#E58045]/10 text-[#E58045] border-[#E58045]' 
                              : 'bg-[#FCFAF7] border-gray-200 text-gray-600'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="scale-85 origin-center">{cat.labelMap[lang] || cat.labelMap.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase block">{t.frequencyLabel}</label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormSchedule([0,1,2,3,4,5,6])}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border-2 transition-all ${
                          formSchedule.length === 7 
                            ? 'bg-[#E58045] text-white border-[#E58045]' 
                            : 'bg-[#FCFAF7] text-gray-600 border-gray-200'
                        }`}
                      >
                        {t.allDays}
                      </button>
                      {[1, 2, 3, 4, 5, 6, 0].map((dayValue) => {
                        const dayNames = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
                        const isSelected = formSchedule.includes(dayValue);
                        return (
                          <button
                            key={dayValue}
                            type="button"
                            onClick={() => {
                              if (isSelected && formSchedule.length > 1) {
                                setFormSchedule(prev => prev.filter(d => d !== dayValue));
                              } else if (!isSelected) {
                                setFormSchedule(prev => [...prev, dayValue]);
                              }
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs border-2 transition-all ${
                              isSelected 
                                ? 'bg-[#E58045] text-white border-[#E58045]' 
                                : 'bg-[#FCFAF7] text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {dayNames[dayValue].charAt(0)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t.instructionsLabel}</label>
                    <textarea
                      id="form-med-notes"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="es: A stomaco pieno dopo i pasti principal"
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] h-16 text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t.voiceMessageLabel}</label>
                    <input
                      id="form-med-voice"
                      type="text"
                      value={formVoicePrompt}
                      onChange={(e) => setFormVoicePrompt(e.target.value)}
                      placeholder={t.voiceMessagePlaceholder}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-[#FCFAF7] focus:outline-none focus:border-[#E58045] text-xs"
                    />
                    <span className="text-3xs text-gray-400 leading-normal block italic mt-1">
                      Se lasciato vuoto, l'app genererà un annuncio base scandendo ordinatamente il nome del farmaco.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block">Suono della Sveglia</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { key: 'standard', title: '⏱️ Standard' },
                        { key: 'campana', title: '🔔 Campana' },
                        { key: 'tranquillo', title: '🕊️ Dolce' },
                        { key: 'sirena', title: '🚨 Sirena' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setFormAudioTone(item.key);
                            playAlarmTone(item.key);
                          }}
                          className={`py-2 px-1 rounded-xl border text-center transition-all text-3xs font-extrabold ${
                            formAudioTone === item.key 
                              ? 'bg-amber-100 text-amber-900 border-[#E58045]' 
                              : 'bg-[#FCFAF7] border-gray-200 text-gray-600'
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      id="cancel-add-modal"
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setIsEditingId(null);
                      }}
                      className="flex-1 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-center text-xs transition-all border border-gray-250"
                    >
                      {t.cancel}
                    </button>

                    <button
                      id="submit-add-modal"
                      type="submit"
                      className="flex-1 py-3.5 rounded-xl bg-[#E58045] hover:bg-[#D5601B] text-white font-extrabold text-center text-xs shadow-md transition-all"
                    >
                      {t.save}
                    </button>
                  </div>

                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ACCESSORY MODAL: BARCODE SCANNER POPUP CARD */}
        <AnimatePresence>

          {showScanner && (
            <BarcodeScanner 
              lang={lang} 
              onScanSuccess={handleBarcodeDecoded}
              onClose={() => setShowScanner(false)}
            />
          )}
        </AnimatePresence>


      </div>

      {/* PREMIUM HIGH-FIDELITY SIDE INFORMATION PANEL (GEOMETRIC BALANCE THEME) */}
      <div id="premium-sidebar" className="hidden lg:flex flex-col w-[360px] bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-md space-y-6 text-left shrink-0">
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#1E40AF] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#1E40AF]" />
            <span>{lang === 'it' ? "Guida Intelligente" : "Smart Assistant"}</span>
          </span>
          <h3 className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight leading-snug">
            {lang === 'it' ? "La tua salute guidata dalla voce." : "Your health, guided by voice."}
          </h3>
          <div className="text-xs text-slate-500 font-medium leading-relaxed">
            {lang === 'it' 
              ? "MediVoce unisce promemoria rassicuranti ad alta leggibilità e controlli vocali avanzati pensati soprattutto per le persone anziane."
              : "MediVoce pairs reassuring voice notes with large geometric clarity & advanced vocal confirmation tailored for older adults."}
          </div>
        </div>

        <div className="space-y-4 border-t border-[#E2E8F0] pt-4">
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 border border-teal-100">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1E293B] uppercase">{lang === 'it' ? "Promemoria Empatici" : "Empathetic Audios"}</h4>
              <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'it' ? "Istruzioni rassicuranti e costanti sia di giorno che di notte con voce naturale." : "Clear voice alerts generated day and night to keep doses perfectly synchronized."}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-lg ${theme.bgLight} flex items-center justify-center ${theme.text} shrink-0 border ${theme.borderLight}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1E293B] uppercase">{lang === 'it' ? "Conferma con un soffio" : "Hands-Free Confirmation"}</h4>
              <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'it' ? "Dì 'Preso' o 'Ho fatto' per registrare senza bisogno di toccare lo schermo." : "Confirm out loud bypasses direct manual input. Easy, safe, and immediate."}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1E293B] uppercase">{lang === 'it' ? "Modalità diurno/notturno" : "Day/Night Contrast"}</h4>
              <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'it' ? "Palette ad alto contrasto adatta anche a problemi visivi o per l'uso stanco notturno." : "Optimized theme colors to alleviate eye strain in dark rooms or low light conditions."}
              </div>
            </div>
          </div>

        </div>

        {/* ACTIVE STATUS SOUNDWAVE SIMULATION */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black text-slate-400 uppercase tracking-widest">{lang === 'it' ? "Stato Servizio" : "Service Status"}</span>
            <span className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1.5s_infinite]" />
              {lang === 'it' ? "Attivo h24" : "On duty 24/7"}
            </span>
          </div>

          <div className="h-6 flex items-center justify-center gap-1 px-1">
            <span className={`w-1.5 h-3 ${theme.visualizer1} rounded-full`} />
            <span className={`w-1.5 h-5 ${theme.visualizer2} rounded-full`} />
            <span className={`w-1.5 h-4 ${theme.visualizer3} rounded-full`} />
            <span className={`w-1.5 h-2 ${theme.visualizer4} rounded-full`} />
            <span className={`w-1.5 h-5 ${theme.visualizer5} rounded-full`} />
            <span className={`w-1.5 h-3 ${theme.visualizer6} rounded-full`} />
            <span className="w-1.5 h-4 bg-slate-400 rounded-full" />
            <span className={`w-1.5 h-2 ${theme.visualizer7} rounded-full`} />
          </div>
          
          <div className="text-3xs text-center text-slate-400 font-bold uppercase">
            {lang === 'it' ? "Pronto per l'ascolto vocale" : "Vocal listening engine online"}
          </div>
        </div>

      </div>

    </div>

  );
}
