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

    // Check if it's an imported custom sound from localStorage
    if (toneType && toneType.startsWith('custom_')) {
      const soundId = toneType.replace('custom_', '');
      
      // Preset check
      if (soundId === 'preset_arpeggio') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.6, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.4);
        });
        return;
      }
      
      if (soundId === 'preset_marimba') {
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.7, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
        return;
      }

      if (soundId === 'preset_trillo') {
        for (let i = 0; i < 4; i++) {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'sine';
          const freq = i % 2 === 0 ? 880 : 987.77; // A5 vs B5 rapid alternation
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.5, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.12);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.12);
        }
        return;
      }

      const savedSounds = localStorage.getItem('medivoce_custom_sounds');
      if (savedSounds) {
        try {
          const parsed = JSON.parse(savedSounds);
          const match = parsed.find((s: any) => s.id === soundId);
          if (match && match.dataUrl) {
            const android = (window as any).Android;
            if (android && android.playDeviceSound && (match.dataUrl.startsWith('content://') || match.dataUrl.startsWith('device_uri_'))) {
              android.playDeviceSound(match.dataUrl);
              return;
            }

            if (match.dataUrl.startsWith('device_uri_') || match.dataUrl.startsWith('content://')) {
              // Web Audio fallback for browser preview of device sounds
              const frequencies = [600, 800, 1000];
              frequencies.forEach((freq, idx) => {
                const osc = audioCtx!.createOscillator();
                const gain = audioCtx!.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.4, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
                osc.connect(gain);
                gain.connect(audioCtx!.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.25);
              });
              return;
            }

            const audio = new Audio(match.dataUrl);
            audio.play().catch(e => console.error("Error playing custom loaded sound:", e));
            return;
          }
        } catch (err) {
          console.error("Error parsing custom sounds for playback:", err);
        }
      }
    }

    // Direct preset check
    if (toneType === 'preset_arpeggio' || toneType === 'custom_preset_arpeggio') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.6, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
      return;
    }

    if (toneType === 'preset_marimba' || toneType === 'custom_preset_marimba') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.7, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });
      return;
    }

    if (toneType === 'preset_trillo' || toneType === 'custom_preset_trillo') {
      for (let i = 0; i < 4; i++) {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        const freq = i % 2 === 0 ? 880 : 987.77;
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.5, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.12);
      }
      return;
    }

    if (toneType === 'campana') {
      // Louder, richer bell sound, repeated twice for longer duration (~5.5 seconds)
      for (let i = 0; i < 2; i++) {
        const strikeTime = now + i * 2.5;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'square';
        osc1.frequency.setValueAtTime(440, strikeTime); // Fundamental A4
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(554.37, strikeTime); // C#5 (Major Third harmony)

        gain.gain.setValueAtTime(0.0, strikeTime);
        gain.gain.linearRampToValueAtTime(0.8, strikeTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, strikeTime + 3); // Slow decay

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(strikeTime);
        osc2.start(strikeTime);
        osc1.stop(strikeTime + 3);
        osc2.stop(strikeTime + 3);
      }

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
      // Louder but still gentle chime, repeated 3 times for longer duration (~6.0 seconds)
      for (let i = 0; i < 3; i++) {
        const chimeTime = now + i * 2.0;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, chimeTime); // Slightly higher than E4

        gain.gain.setValueAtTime(0.0, chimeTime);
        gain.gain.linearRampToValueAtTime(0.8, chimeTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, chimeTime + 2.0);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(chimeTime);
        osc.stop(chimeTime + 2.0);
      }

    } else {
      // Standard telephone alert chime, louder and more annoying, repeated 3 times (~5.4 seconds)
      for (let i = 0; i < 3; i++) {
        const ringTime = now + i * 2.2;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'square';
        osc1.frequency.setValueAtTime(700, ringTime);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(700, ringTime + 0.2);

        gain.gain.setValueAtTime(0.0, ringTime);
        gain.gain.linearRampToValueAtTime(0.8, ringTime + 0.01);
        gain.gain.setValueAtTime(0.8, ringTime + 0.15);
        gain.gain.setValueAtTime(0, ringTime + 0.16);
        gain.gain.setValueAtTime(0.8, ringTime + 0.2);
        gain.gain.setValueAtTime(0.8, ringTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.01, ringTime + 1.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(ringTime);
        osc1.stop(ringTime + 1.0);
        osc2.start(ringTime + 0.2);
        osc2.stop(ringTime + 1.0);
      }
    }
  } catch (error) {
    console.error('Failed to play custom synthesizer audio tone: ', error);
  }
}

/**
 * Uses Web Speech Synthesis to announce reminders with customization options.
 * Prioritizes natural, warm, human-like female voices if available on the system.
 */
// Cache for voices loaded asynchronously on mobile browsers/webviews
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices() || [];
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      console.log('[MediVoce] Loaded voices from onvoiceschanged:', cachedVoices.map(v => `${v.name} (${v.lang})`));
    };
  } catch (e) {
    console.error('[MediVoce] Error initializing SpeechSynthesis voices listener:', e);
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

  try {
    // Wake up speech synthesis in case it's in a paused state (very common on mobile)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Cancel any currently speaking alerts only if they are active, to prevent stalling the queue
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

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

    // Use a longer setTimeout (250ms) before speaking. This is an essential workaround for Chrome on Android 
    // and mobile webviews where calling cancel() and speak() too quickly cancels the new utterance or locks the TTS queue.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLocale;

      // Customize velocity & vocal resonance
      utterance.rate = speed;
      utterance.volume = 1.0; // Explicitly ensure maximum volume
      
      if (toneType === 'empathetic') {
        utterance.pitch = 1.25; // slightly higher, warmer and sweeter
      } else {
        utterance.pitch = 1.1; // a bit more authoritative
      }

      // Try to find a warm, high-quality human-sounding female voice
      let allVoices: SpeechSynthesisVoice[] = [];
      try {
        allVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        console.warn('[MediVoce] Failed to get voices from window.speechSynthesis, using cache:', e);
      }
      if (!allVoices || allVoices.length === 0) {
        allVoices = cachedVoices;
      }

      const langVoices = allVoices.filter(v => {
        const LowerLang = (v.lang || '').toLowerCase().replace('_', '-');
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

        // Priority 1: explicitly Female voices that are LOCAL (extremely reliable offline, won't fail silently)
        let selectedVoice = langVoices.find(v => {
          const nameLower = (v.name || '').toLowerCase();
          return femaleKeywords.some(kw => nameLower.includes(kw)) && v.localService;
        });

        // Priority 2: explicitly Female voices (even if network/Google)
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => {
            const nameLower = (v.name || '').toLowerCase();
            return femaleKeywords.some(kw => nameLower.includes(kw));
          });
        }

        // Priority 3: Not explicitly male voices, preferring local
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => {
            const nameLower = (v.name || '').toLowerCase();
            const isNotMale = !maleNames.some(kw => nameLower.includes(kw));
            return isNotMale && v.localService;
          });
        }

        // Priority 4: First available local voice
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => v.localService);
        }

        // Fallback: Use the first available voice for the target language (hoping it's female)
        if (!selectedVoice) {
          selectedVoice = langVoices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`[MediVoce] Selected female speech voice: ${selectedVoice.name} (Local: ${selectedVoice.localService}, Lang: ${selectedVoice.lang})`);
        }
      }

      // To prevent garbage collection of the utterance object on Android/Chrome,
      // which causes speech to stop mid-sentence or fail silently.
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (!win._activeUtterances) {
          win._activeUtterances = new Set();
        }
        win._activeUtterances.add(utterance);
      }

      // Add Error Handler to fallback to system default voice if selected voice fails (e.g. Google network voices offline)
      utterance.onerror = (err) => {
        console.error('[MediVoce] SpeechSynthesis error:', err.error);
        if (typeof window !== 'undefined') {
          const win = window as any;
          if (win._activeUtterances) {
            win._activeUtterances.delete(utterance);
          }
        }

        // Don't rerun fallback if the error was just "interrupted" or "canceled" via manual stop/cancel
        if (err.error !== 'interrupted' && err.error !== 'canceled') {
          console.warn('[MediVoce] SpeechSynthesis failed. Retrying with default device voice engine...');
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          fallbackUtterance.lang = targetLocale;
          fallbackUtterance.rate = speed;
          fallbackUtterance.volume = 1.0;
          fallbackUtterance.pitch = toneType === 'empathetic' ? 1.25 : 1.1;
          
          if (typeof window !== 'undefined') {
            const win = window as any;
            if (win._activeUtterances) {
              win._activeUtterances.add(fallbackUtterance);
            }
            fallbackUtterance.onend = () => {
              if (win._activeUtterances) win._activeUtterances.delete(fallbackUtterance);
            };
            fallbackUtterance.onerror = () => {
              if (win._activeUtterances) win._activeUtterances.delete(fallbackUtterance);
            };
          }
          
          try {
            window.speechSynthesis.speak(fallbackUtterance);
          } catch (e) {
            console.error('[MediVoce] Fallback speech trigger failed:', e);
          }
        }
      };

      utterance.onend = () => {
        if (typeof window !== 'undefined') {
          const win = window as any;
          if (win._activeUtterances) {
            win._activeUtterances.delete(utterance);
          }
        }
        console.log('[MediVoce] Speech completed successfully.');
      };

      // Speak!
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('[MediVoce] Direct speech trigger failed:', e);
      }
    }, 250);

  } catch (error) {
    console.error('[MediVoce] Exception during speakAnnouncement:', error);
  }
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
