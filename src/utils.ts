/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode } from './types';

// Web Audio API Audio synthesizer to generate alarm tones without external static file requests.
let audioCtx: AudioContext | null = null;

export function playAlarmTone(toneType: string) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (toneType === 'campana') {
      // Louder, richer bell sound
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(440, now); // Fundamental A4
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(554.37, now); // C#5 (Major Third harmony)

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 3); // Slow decay

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3);
      osc2.stop(now + 3);

    } else if (toneType === 'sirena') {
      // Louder, more penetrating alarm tone
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.4);
      osc.frequency.linearRampToValueAtTime(500, now + 0.8);
      osc.frequency.linearRampToValueAtTime(800, now + 1.2);
      osc.frequency.linearRampToValueAtTime(500, now + 1.6);
      osc.frequency.linearRampToValueAtTime(800, now + 2.0);
      osc.frequency.linearRampToValueAtTime(500, now + 2.4);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 2.5);

    } else if (toneType === 'tranquillo') {
      // Louder but still gentle chime
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now); // Slightly higher than E4

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 2.0);

    } else {
      // Standard telephone alert chime, louder and more annoying
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(700, now);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(700, now + 0.2);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.setValueAtTime(0.8, now + 0.15);
      gain.gain.setValueAtTime(0, now + 0.16);
      gain.gain.setValueAtTime(0.8, now + 0.2);
      gain.gain.setValueAtTime(0.8, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 1.0);
      osc2.start(now + 0.2);
      osc2.stop(now + 1.0);
    }
  } catch (error) {
    console.error('Failed to play custom synthesizer audio tone: ', error);
  }
}

/**
 * Uses Web Speech Synthesis to announce reminders with customization options.
 * Prioritizes natural, warm, human-like female voices if available on the system.
 */
export function speakAnnouncement(
  text: string,
  lang: LanguageCode,
  speed: number = 0.8, // default slower for seniors
  toneType: 'empathetic' | 'firm' = 'empathetic'
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment.');
    return;
  }

  // Cancel any currently speaking alerts
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set appropriate language locale
  let targetLocale = 'it-IT';
  let langPrefix = 'it';
  
  if (lang === 'es') {
    targetLocale = 'es-ES';
    langPrefix = 'es';
  } else if (lang === 'fr') {
    targetLocale = 'fr-FR';
    langPrefix = 'fr';
  } else if (lang === 'en') {
    targetLocale = 'en-US';
    langPrefix = 'en';
  } else {
    targetLocale = 'it-IT';
    langPrefix = 'it';
  }

  utterance.lang = targetLocale;

  // Customize velocity & vocal resonance
  utterance.rate = speed;
  
  if (toneType === 'empathetic') {
    utterance.pitch = 1.25; // slightly higher, warmer and sweeter, also helps force female pitch on ambiguous voices
  } else {
    utterance.pitch = 1.1; // a bit more authoritative but still feminine range
  }

  // Try to find a warm, high-quality human-sounding female voice
  const allVoices = window.speechSynthesis.getVoices();
  const langVoices = allVoices.filter(v => {
    const LowerLang = v.lang.toLowerCase().replace('_', '-');
    return LowerLang.startsWith(langPrefix);
  });

  if (langVoices.length > 0) {
    // List of common female, natural, or premium voice descriptors
    const femaleKeywords = [
      'female', 'donna', 'femme', 'mujer', 'elsa', 'paola', 'sonia', 'alice', 
      'samantha', 'victoria', 'zira', 'hazel', 'susan', 'karen', 'moira', 'tessa', 
      'helena', 'sabina', 'hortense', 'julie', 'pauline', 'clara', 'laura', 'silvia', 
      'giulia', 'melina', 'paula', 'cosmia', 'rosa', 'chiara', 'bianca', 'luciana', 'carmela'
    ];
    
    const maleNames = ['david', 'george', 'cosimo', 'mark', 'ravi', 'sean', 'guy', 'uomo', 'stefano', 'male', 'luca', 'diego', 'pablo', 'thomas', 'arthur', 'jacques', 'paul', 'martin', 'daniel', 'rocco', 'bernard', 'gabriel', 'jorge', 'piero', 'giovanni', 'mario'];

    // Priority 1: explicitly Female voices
    let selectedVoice = langVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return femaleKeywords.some(kw => nameLower.includes(kw));
    });

    // Priority 2: Not explicitly male voices, preferring Google/Network voices (often female by default)
    if (!selectedVoice) {
      selectedVoice = langVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        const isNotMale = !maleNames.some(kw => nameLower.includes(kw));
        const isGoogle = nameLower.includes('google') || nameLower.includes('network');
        return isNotMale && isGoogle;
      });
    }

    // Priority 3: Avoid known male names
    if (!selectedVoice) {
      selectedVoice = langVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return !maleNames.some(kw => nameLower.includes(kw));
      });
    }

    // Fallback: Use the first available voice for the target language (hoping it's female)
    if (!selectedVoice) {
      selectedVoice = langVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`[MediVoce] Selected female speech voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }
  }

  window.speechSynthesis.speak(utterance);
}

export function getLocalIsoDate(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

/**
 * Set of mocked barcodes and prefilled pharmacology descriptions for the auto barcode scan feature
 */
export interface BarcodeResult {
  code: string;
  name: string;
  dosage: string;
  instructions: string;
  category: 'pill' | 'bottle' | 'inhaler' | 'injection';
}

export interface RawBarcodeResult {
  code: string;
  name: string;
  dosage: Record<string, string>;
  instructions: Record<string, string>;
  category: 'pill' | 'bottle' | 'inhaler' | 'injection';
}

export const BARCODE_MOCK_DATABASE: RawBarcodeResult[] = [
  {
    code: "800883100234",
    name: "Tachipirina 1000mg",
    dosage: {
      it: "1 compressa",
      en: "1 tablet",
      es: "1 tableta",
      fr: "1 comprimé"
    },
    instructions: {
      it: "Da deglutire con acqua a stomaco pieno per dolori o febbre.",
      en: "To swallow with water on a full stomach for pain or fever.",
      es: "Tragar con agua con el estómago lleno para el dolor o la fiebre.",
      fr: "À avaler avec de l'eau sur estomac plein pour les douleurs ou la fièvre."
    },
    category: "pill"
  },
  {
    code: "400423982341",
    name: "Aspirina C",
    dosage: {
      it: "1 compressa effervescente",
      en: "1 effervescent tablet",
      es: "1 tableta efervescente",
      fr: "1 comprimé effervescent"
    },
    instructions: {
      it: "Sciogliere in un bicchiere d'acqua dopo i pasti principali.",
      en: "Dissolve in a glass of water after main meals.",
      es: "Disolver en un vaso de agua después de las comidas principales.",
      fr: "Dissoudre dans un verre d'eau après les repas principaux."
    },
    category: "pill"
  },
  {
    code: "800312012034",
    name: "Sciroppo Bronchenolo",
    dosage: {
      it: "10 ml",
      en: "10 ml",
      es: "10 ml",
      fr: "10 ml"
    },
    instructions: {
      it: "Agitare prima dell'uso. Utilizzare l'apposito misurino.",
      en: "Shake before use. Use the provided measuring cup.",
      es: "Agitar antes de usar. Utilizar el vaso dosificador proporcionado.",
      fr: "Agiter avant emploi. Utiliser le gobelet doseur fourni."
    },
    category: "bottle"
  },
  {
    code: "501235123984",
    name: "Seretide Aerosol",
    dosage: {
      it: "2 inalazioni",
      en: "2 inhalations",
      es: "2 inhalaciones",
      fr: "2 inhalations"
    },
    instructions: {
      it: "Effettuare sciacqui orali dopo l'inalazione per prevenire infiammazioni.",
      en: "Rinse mouth after inhalation to prevent inflammation.",
      es: "Enjuagar la boca después de la inhalación para prevenir inflamación.",
      fr: "Rincer la bouche après inhalation pour prévenir l'inflammation."
    },
    category: "inhaler"
  },
  {
    code: "078345672345",
    name: "Insulina Rapida Lantus",
    dosage: {
      it: "8 Unità",
      en: "8 Units",
      es: "8 Unidades",
      fr: "8 Unités"
    },
    instructions: {
      it: "Sotto-cutanea prima dei pasti serali. Iniettare a rotazione sull'addome.",
      en: "Subcutaneous before evening meals. Rotate injection sites on the abdomen.",
      es: "Subcutánea antes de las comidas nocturnas. Rotar los sitios de inyección en el abdomen.",
      fr: "Sous-cutanée avant les repas du soir. Alterner les sites d'injection sur l'abdomen."
    },
    category: "injection"
  }
];

export function getRandomBarcode(lang: string = 'it'): BarcodeResult {
  const index = Math.floor(Math.random() * BARCODE_MOCK_DATABASE.length);
  const raw = BARCODE_MOCK_DATABASE[index];
  return {
    code: raw.code,
    name: raw.name,
    dosage: raw.dosage[lang] || raw.dosage['en'] || raw.dosage['it'] || '',
    instructions: raw.instructions[lang] || raw.instructions['en'] || raw.instructions['it'] || '',
    category: raw.category
  };
}
