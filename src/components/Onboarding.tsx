/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS, LanguageCode } from '../types';
import { speakAnnouncement } from '../utils';
import { Globe, ArrowRight, Volume2, ShieldCheck, Camera, MapPin } from 'lucide-react';

interface OnboardingProps {
  onComplete: (lang: LanguageCode) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [lang, setLang] = useState<LanguageCode>('it');
  const [step, setStep] = useState<number>(-1);

  const t = TRANSLATIONS[lang];

  // Vocalize step summary for senior acoustic reassurance (DISABLED)
  const speakCurrentStepInfo = (language: LanguageCode, currentStep: number) => {
    // Disabled as per user request: "la voce si senta solo per avvisare di prendere la medicina"
  };

  const handleLanguageSelect = (selectedLang: LanguageCode) => {
    setLang(selectedLang);
    speakCurrentStepInfo(selectedLang, 0);
  };

  const nextStep = () => {
    if (step < 3) {
      const nextS = step + 1;
      setStep(nextS);
      speakCurrentStepInfo(lang, nextS);
    } else {
      speakAnnouncement(lang === 'it' ? "Installazione completata! Benvenuto in MediVoce." : "Setup complete! Welcome to MediVoce.", lang, 0.85);
      onComplete(lang);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      const prevS = step - 1;
      setStep(prevS);
      speakCurrentStepInfo(lang, prevS);
    }
  };

  return (
    <div id="onboarding-root" className="fixed inset-0 bg-[#F0F4F8] z-50 flex flex-col font-sans text-[#1E293B] overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto p-5 sm:p-8 md:p-10 flex flex-col gap-6 pb-36">
          {/* Upper header section */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                MV
              </div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-[#1E3A8A]">MediVoce</span>
            </div>
            <div className="flex items-center gap-2 bg-[#EFF6FF] py-1 px-3 rounded-full text-xs font-semibold text-[#1E40AF] border border-[#DBEAFE]">
              <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{lang.toUpperCase()}</span>
            </div>
          </header>

          {/* Main card illustration / text */}
          <main className="w-full">
            <AnimatePresence mode="wait">
              {step === -1 && (
                <motion.div
                  key="step-privacy"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                    <ShieldCheck className="w-10 h-10" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      Informativa Privacy e Avvertenza Medica
                    </h2>
                    
                    <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm text-left max-h-[35vh] overflow-y-auto space-y-4 font-medium text-sm text-[#475569]">
                      <div>
                        <h3 className="font-extrabold text-[#1E293B] mb-1">🏥 Avvertenza Medica</h3>
                        <p className="leading-relaxed">{t.medicalDisclaimer}</p>
                      </div>
                      <div className="h-px bg-slate-100 w-full" />
                      <div>
                        <h3 className="font-extrabold text-[#1E293B] mb-1">🛡️ Privacy Policy</h3>
                        <p className="leading-relaxed">{t.privacyText}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  {/* Language Selector Box */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
                    <label className="block text-xs font-bold tracking-wider text-[#64748B] uppercase">{t.selectLanguage}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['it', 'en', 'es', 'fr'] as LanguageCode[]).map((l) => (
                        <button
                          id={`lang-btn-${l}`}
                          key={l}
                          onClick={() => handleLanguageSelect(l)}
                          className={`py-3 px-4 rounded-xl font-bold border-2 text-sm transition-all ${
                            lang === l
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md scale-102'
                              : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]'
                          }`}
                        >
                          {l === 'it' && '🇮🇹 Italiano'}
                          {l === 'en' && '🇺🇸 English'}
                          {l === 'es' && '🇪🇸 Español'}
                          {l === 'fr' && '🇫🇷 Français'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Asset loaded or placeholder illustration wrapper */}
                  <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white shadow-md border border-[#E2E8F0] flex items-center justify-center p-2">
                    <img
                      src="/src/assets/images/app_icon_pill_1783613961215.jpg"
                      alt="MediVoce Logo Graphic"
                      className="w-full h-full object-contain animate-pulse-slow"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://picsum.photos/seed/medivoce/300/300";
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.welcome}
                    </h1>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.welcomeDescription}
                    </p>

                    <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-left">
                      <p className="text-xs text-rose-700 font-bold leading-relaxed">
                        {t.medicalDisclaimer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] border border-[#DBEAFE]">
                    <Volume2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.stepVoiceTitle}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.stepVoiceDesc}
                    </p>
                  </div>

                  <button
                    id="listen-test-btn"
                    onClick={() => speakCurrentStepInfo(lang, 1)}
                    className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] font-bold text-xs border border-[#DBEAFE] transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{t.testVoiceBtn}</span>
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#10B981] border border-[#A7F3D0]">
                    <Camera className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.stepScanTitle}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.stepScanDesc}
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] border border-[#DBEAFE]">
                    <MapPin className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1E3A8A]">
                      {t.stepPharmaTitle}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed font-medium">
                      {t.stepPharmaDesc}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Sticky Bottom Footer */}
      {step >= -1 && (
        <footer className="w-full bg-[#F0F4F8] border-t border-[#E2E8F0] p-4 sm:p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10">
          <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
            {/* Progress Dots */}
            {step >= 0 && (
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === idx ? 'w-6 bg-[#2563EB]' : 'w-2 bg-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  id="back-step-btn"
                  onClick={prevStep}
                  className="w-1/3 py-3.5 px-3 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#475569] font-bold text-center transition-all border border-[#E2E8F0] text-sm sm:text-base shadow-sm"
                >
                  {t.buttonBack}
                </button>
              )}

              {step === -1 ? (
                <button
                  id="accept-privacy-btn"
                  onClick={nextStep}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black flex items-center justify-center gap-2 shadow-md transition-all text-base sm:text-lg"
                >
                  <span>Accetto / I Accept</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  id="next-step-btn"
                  onClick={nextStep}
                  className={`${step > 0 ? 'w-2/3' : 'w-full'} py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black flex items-center justify-center gap-2 shadow-md transition-all text-base sm:text-lg`}
                >
                  <span>{step === 3 ? t.buttonFinish : t.buttonNext}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
