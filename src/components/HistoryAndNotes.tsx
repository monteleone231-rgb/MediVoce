/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, FileText, Check, AlertCircle, Mic, MicOff, Star, Trash2, Heart, Share2, Smile, Copy } from 'lucide-react';
import { LanguageCode, TRANSLATIONS, Medication, DoctorNote } from '../types';
import { getLocalIsoDate, isScheduledOnDate } from '../utils';

interface HistoryAndNotesProps {
  lang: LanguageCode;
  medications: Medication[];
  notes: DoctorNote[];
  onAddNote: (text: string, isSymptom: boolean) => void;
  onDeleteNote: (id: string) => void;
}

export default function HistoryAndNotes({ lang, medications, notes, onAddNote, onDeleteNote }: HistoryAndNotesProps) {
  const t = TRANSLATIONS[lang];
  const [activeDayIndex, setActiveDayIndex] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0-indexed Mon-Sun
  
  // Note Form State
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSymptom, setIsSymptom] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string>('');

  // Wellbeing and Share State
  const [wellBeingLogs, setWellBeingLogs] = useState<{[key: string]: number}>(() => {
    try {
      const stored = localStorage.getItem('medivoce_wellbeing_logs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  const todayStr = getLocalIsoDate();
  const todayWellBeingScore = wellBeingLogs[todayStr] || 0;

  const handleSetWellBeing = (score: number) => {
    const updated = { ...wellBeingLogs, [todayStr]: score };
    setWellBeingLogs(updated);
    localStorage.setItem('medivoce_wellbeing_logs', JSON.stringify(updated));
  };

  const handleCopyReport = () => {
    const activeMedsToday = medications.filter(m => m.isActive && isScheduledOnDate(m, new Date()));
    let totalScheduledToday = 0;
    let takenToday = 0;
    activeMedsToday.forEach(m => {
      const medTimes = m.times && m.times.length > 0 ? m.times : [m.time];
      totalScheduledToday += medTimes.length;
      takenToday += medTimes.filter(t => (m.history || {})[`${todayStr}_${t}`] === true || (medTimes.length === 1 && (m.history || {})[todayStr] === true)).length;
    });

    const complianceText = totalScheduledToday === 0 
      ? (lang === 'it' ? 'Nessun farmaco programmato per oggi.' : 'No medications scheduled for today.')
      : (lang === 'it' 
          ? `Presi ${takenToday} di ${totalScheduledToday} farmaci (${Math.round((takenToday/totalScheduledToday)*100)}%)` 
          : `Took ${takenToday} of ${totalScheduledToday} meds (${Math.round((takenToday/totalScheduledToday)*100)}%)`);

    const wellbeingEmoji = todayWellBeingScore === 5 ? '😊' : todayWellBeingScore === 4 ? '🙂' : todayWellBeingScore === 3 ? '😐' : todayWellBeingScore === 2 ? '🙁' : todayWellBeingScore === 1 ? '😔' : 'Non registrato / Not logged';

    // Get today's notes
    const todayNotes = notes.filter(n => n.date === todayStr);
    const notesText = todayNotes.length === 0 
      ? (lang === 'it' ? 'Nessun sintomo o nota inserita.' : 'No notes or symptoms reported.')
      : todayNotes.map(n => `- [${n.hasSymptom ? 'Sintomo' : 'Nota'}]: ${n.text}`).join('\n');

    const report = lang === 'it' ? `📋 **REPORT SALUTE MEDIVOCE** (${todayStr})
--------------------------------------
👤 Paziente: Assistito MediVoce
📈 Aderenza Farmaci Oggi: ${complianceText}
🌸 Stato di Benessere: ${wellbeingEmoji} ${todayWellBeingScore ? `(${todayWellBeingScore}/5)` : ''}

📝 Note e Sintomi registrati oggi:
${notesText}

---
Inviato tramite l'app MediVoce.` 
: `📋 **MEDIVOCE HEALTH REPORT** (${todayStr})
--------------------------------------
👤 Patient: MediVoce User
📈 Medication Adherence Today: ${complianceText}
🌸 Well-Being Status: ${wellbeingEmoji} ${todayWellBeingScore ? `(${todayWellBeingScore}/5)` : ''}

📝 Notes & Symptoms logged today:
${notesText}

---
Sent via MediVoce app.`;

    navigator.clipboard.writeText(report);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  // Days of the week mapping
  const weekdays = [
    { label: t.mon, val: 1 },
    { label: t.tue, val: 2 },
    { label: t.wed, val: 3 },
    { label: t.thu, val: 4 },
    { label: t.fri, val: 5 },
    { label: t.sat, val: 6 },
    { label: t.sun, val: 0 }
  ];

  // Helper date formatting to read compliance history
  const getPastDateString = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return getLocalIsoDate(d);
  };

  // Compute daily status for a given weekday value
  const getDayComplianceStatus = (dayVal: number) => {
    // Check if taken in history
    // For simplicity, we check history for the nearest calendar date of that weekday
    const currentDay = new Date().getDay();
    const diff = (dayVal - currentDay - 7) % 7; // relative index representing nearest past date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - Math.abs(diff === 0 ? 0 : diff));
    const dateStr = getLocalIsoDate(targetDate);

    // filter medications active on this target date
    const activeMeds = medications.filter(m => m.isActive && isScheduledOnDate(m, targetDate));
    if (activeMeds.length === 0) return 'none'; // nothing scheduled

    let totalSlots = 0;
    let takenSlots = 0;

    activeMeds.forEach(m => {
      const medTimes = m.times && m.times.length > 0 ? m.times : [m.time];
      totalSlots += medTimes.length;
      takenSlots += medTimes.filter(t => (m.history || {})[`${dateStr}_${t}`] === true || (medTimes.length === 1 && (m.history || {})[dateStr] === true)).length;
    });
    
    if (takenSlots === totalSlots) return 'full';
    if (takenSlots > 0) return 'partial';
    return 'missed';
  };

  // Overall compliance calculations
  const calculateTotalWeeklyRate = () => {
    let totalScheduledCount = 0;
    let totalTakenCount = 0;

    // Check last 7 days schedules
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dayVal = targetDate.getDay();
      const dateStr = getLocalIsoDate(targetDate);

      const activeMeds = medications.filter(m => m.isActive && isScheduledOnDate(m, targetDate));
      activeMeds.forEach(m => {
        const medTimes = m.times && m.times.length > 0 ? m.times : [m.time];
        totalScheduledCount += medTimes.length;
        totalTakenCount += medTimes.filter(t => (m.history || {})[`${dateStr}_${t}`] === true || (medTimes.length === 1 && (m.history || {})[dateStr] === true)).length;
      });
    }

    if (totalScheduledCount === 0) return 100;
    return Math.round((totalTakenCount / totalScheduledCount) * 100);
  };

  const currentRate = calculateTotalWeeklyRate();

  // Speech Recognition dictation setup
  const toggleSpeechDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingError(lang === 'it' ? "La dettatura vocale non è supportata su questo browser." : "Speech recognition is not supported on this browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setRecordingError('');
    setIsRecording(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'it' ? 'it-IT' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setNoteContent(prev => prev ? prev + ' ' + text : text);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        setRecordingError(lang === 'it' ? "Errore di registrazione. Riprova." : "Audio error. Please try again.");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    onAddNote(noteContent, isSymptom);
    setNoteContent('');
    setIsSymptom(false);
  };
  return (
    <div className="space-y-6">
      
      {/* 1. CRONOLOGIA SETTIMANALE SECTION */}
      <section id="weekly-adherence-card" className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
        
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] border border-[#DBEAFE]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1E3A8A] tracking-tight">{t.historyTitle}</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t.historySubtitle}</p>
          </div>
        </div>

        {/* Adherence Speedometer Bar */}
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#475569]">{t.weeklyRate || "Statistiche Mensili e Settimanali"}</span>
            <span className="font-extrabold text-lg text-[#1E3A8A]">{currentRate}%</span>
          </div>
          
          <div className="w-full bg-gray-200/70 h-3 rounded-full overflow-hidden">
            <div 
              style={{ width: `${currentRate}%` }} 
              className={`h-full transition-all duration-500 rounded-full ${
                currentRate > 80 ? 'bg-emerald-500' : currentRate > 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>

          <p className="text-3xs text-gray-500 leading-relaxed font-semibold">
            {currentRate === 100 
              ? (lang === 'it' ? "Aderenza perfetta o dati in calcolo per il mese." : "Perfect adherence or calculating monthly data.")
              : (lang === 'it' ? "Questi dati includono il calcolo mensile basato sull'attività recente." : "Monthly statistics are calculated from recent activity.")}
          </p>
        </div>

        {/* Monthly Calendar View (Placeholder for advanced full-month rendering) */}
        <div className="bg-[#EFF6FF]/65 border border-[#DBEAFE] p-4 rounded-xl mt-4">
          <h4 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide mb-3 flex items-center justify-between">
            {lang === 'it' ? "Calendario Dosi Mensile" : "Monthly Dosage Calendar"}
            <span className="text-[#2563EB]">{new Date().toLocaleString(lang==='it'?'it-IT':'en-US', { month: 'long', year: 'numeric' })}</span>
          </h4>
          <div className="grid grid-cols-7 gap-1 text-center text-3xs font-semibold text-[#64748B] mb-1">
            {weekdays.map(d => <div key={d.label}>{d.label.substring(0,2)}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Generating a simple pseudo-calendar for the current month */}
            {Array.from({ length: 35 }).map((_, i) => {
              const dateVal = i - 2; // Offset for visually starting somewhere
              if (dateVal <= 0 || dateVal > 31) return <div key={i} className="p-2"></div>;
              
              // Mock random adherence past dates for visual monthly calendar
              const isPast = dateVal <= new Date().getDate();
              const isToday = dateVal === new Date().getDate();
              let bg = "bg-white border-[#E2E8F0]";
              let text = "text-[#475569]";
              
              if (isToday) {
                 bg = "bg-[#2563EB] border-[#2563EB]";
                 text = "text-white font-bold";
              } else if (isPast) {
                 // Simplistic mock to show it's taken
                 bg = "bg-emerald-50 border-emerald-100 text-emerald-800";
              }

              return (
                <div key={i} className={`flex items-center justify-center p-1.5 rounded-lg border text-3xs ${bg} ${text}`}>
                  {dateVal}
                </div>
              );
            })}
          </div>
        </div>

        {/* Circular Weekday selector widgets */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekdays.map((day, idx) => {
            const status = getDayComplianceStatus(day.val);
            const isActive = activeDayIndex === idx;

            return (
              <button
                id={`weekday-indicator-${idx}`}
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`flex items-center justify-center aspect-square rounded-full transition-all border-4 text-base font-black uppercase shadow-sm cursor-pointer ${
                  isActive 
                    ? 'border-[#2563EB] scale-105 shadow-md' 
                    : 'border-transparent'
                } ${
                  status === 'full' 
                    ? 'bg-emerald-500 text-white' 
                    : status === 'partial' 
                    ? 'bg-amber-400 text-gray-900' 
                    : status === 'missed' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-slate-100 text-[#475569]'
                }`}
              >
                {day.label.charAt(0)}
              </button>
            );
          })}
        </div>

        {/* Day-specific compliance breakdown details list */}
        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wide">
            {lang === 'it' ? "Dettaglio di " : "Details for "} {weekdays[activeDayIndex].label}
          </h4>

          {(() => {
            const currentDay = new Date().getDay();
            const diff = (weekdays[activeDayIndex].val - currentDay - 7) % 7;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - Math.abs(diff === 0 ? 0 : diff));
            const activeMeds = medications.filter(m => m.isActive && isScheduledOnDate(m, pastDate));
            if (activeMeds.length === 0) {
              return (
                <p className="text-sm italic text-gray-400 py-2">
                  {lang === 'it' ? "Nessuna medicina programmata per oggi." : "No medications scheduled for this day."}
                </p>
              );
            }
            return (
              <div className="space-y-1.5">
                {activeMeds.flatMap((med, medIdx) => {
                  const pastDateStr = getLocalIsoDate(pastDate);
                  const medTimes = med.times && med.times.length > 0 ? med.times : [med.time];

                  return medTimes.map((timeSlot, timeIdx) => {
                    const slotKey = `${pastDateStr}_${timeSlot}`;
                    const isTaken = med.history[slotKey] === true || (medTimes.length === 1 && med.history[pastDateStr] === true);

                    return (
                      <div key={`${medIdx}-${timeIdx}`} className="flex justify-between items-center py-2 px-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-sm">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#1E293B] leading-tight">{med.name}</span>
                          <span className="text-xs text-slate-500 font-medium mt-0.5">{med.dosage}</span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isTaken 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isTaken ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{isTaken ? (lang === 'it' ? 'Presa' : 'Taken') : (lang === 'it' ? 'Salto' : 'Pending')}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">({timeSlot})</span>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            );
          })()}
        </div>

      </section>

      {/* 2. STATO DI BENESSERE & REPORT ASSISTENTE SECTION */}
      <section id="wellbeing-share-card" className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
              <Smile className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-extrabold text-[#1E3A8A] tracking-tight">
                {lang === 'it' ? "Come ti senti oggi?" : "How do you feel today?"}
              </h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-left">
                {lang === 'it' ? "Stato di salute e condivisione" : "Well-being & caregiver report"}
              </p>
            </div>
          </div>
        </div>

        {/* Clickable Emoji ratings */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {([
            { score: 1, emoji: '😔', label: { it: 'Triste', en: 'Sad' } },
            { score: 2, emoji: '🙁', label: { it: 'Giù', en: 'Unwell' } },
            { score: 3, emoji: '😐', label: { it: 'Così così', en: 'Okay' } },
            { score: 4, emoji: '🙂', label: { it: 'Bene', en: 'Good' } },
            { score: 5, emoji: '😊', label: { it: 'Ottimo', en: 'Great' } }
          ]).map((item) => {
            const isSelected = todayWellBeingScore === item.score;
            return (
              <button
                key={item.score}
                type="button"
                onClick={() => handleSetWellBeing(item.score)}
                className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-amber-50 border-amber-300 scale-105 shadow-xs font-bold' 
                    : 'bg-slate-50/50 border-gray-150 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow-xs transition-transform active:scale-125">{item.emoji}</span>
                <span className={`text-[9px] tracking-tight ${isSelected ? 'text-amber-800 font-extrabold' : 'text-gray-400 font-medium'}`}>
                  {item.label[lang] || item.label.en}
                </span>
              </button>
            );
          })}
        </div>

        {/* Caregiver Report Button card */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-2.5 text-left relative overflow-hidden">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#1E3A8A]">
                {lang === 'it' ? "Invia Report al Caregiver" : "Share Report with Caregiver"}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium leading-normal mt-0.5">
                {lang === 'it' 
                  ? "Crea un report di oggi con medicinali presi, sintomi e livello di benessere pronto da inviare su WhatsApp o SMS." 
                  : "Copies a formatted summary of today's compliance, wellness score, and notes to share."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyReport}
            className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              showShareToast 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {showShareToast ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>{lang === 'it' ? "Report Copiato!" : "Report Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'it' ? "Copia Report Giornaliero" : "Copy Today's Report"}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 3. REGISTRO DELLE NOTE SUI FARMACI SECTION */}
      <section id="doctor-notes-card" className="bg-white px-4 py-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
        
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] border border-[#DBEAFE]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1E3A8A] tracking-tight">{t.notesTitle}</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t.notesSubtitle}</p>
          </div>
        </div>

        {/* Dictate / Type Note Form */}
        <form onSubmit={handleSaveNote} className="space-y-3">
          <div className="relative">
            <textarea
              id="notes-text-area"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full h-24 p-3.5 rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] focus:outline-none focus:border-[#2563EB] text-sm leading-relaxed"
            />
            {/* Floating Speech-to-Text Microphone Mic button */}
            <button
              id="speech-dictation-mic-btn"
              type="button"
              onClick={toggleSpeechDictation}
              className={`absolute bottom-3 right-3 p-3 rounded-full shadow-md text-white transition-all flex items-center justify-center ${
                isRecording 
                  ? 'bg-red-500 animate-[pulse_1.2s_infinite] scale-105' 
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
              title={t.notesVoiceBtn}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Error alert for microphone features */}
          {recordingError && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100 flex items-center gap-1.5">
              <span>⚠️ {recordingError}</span>
            </p>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 hover:cursor-pointer">
              <input
                id="notes-symptom-check"
                type="checkbox"
                checked={isSymptom}
                onChange={(e) => setIsSymptom(e.target.checked)}
                className="w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB]"
              />
              <span className="text-xs font-bold text-[#475569]">{t.notesDoctorLabel}</span>
            </label>

            <button
              id="save-note-btn"
              type="submit"
              disabled={!noteContent.trim()}
              className="py-2.5 px-6 rounded-xl bg-[#1E293B] hover:bg-black text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-40"
            >
              {t.save}
            </button>
          </div>
        </form>

        {/* Log list of notes */}
        <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
          {notes.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              {lang === 'it' ? "Ancora nessun appunto inserito nel registro." : "No notes written down yet."}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div 
                  id={`note-item-${note.id}`}
                  key={note.id} 
                  className={`p-3.5 rounded-2xl border flex justify-between items-start gap-3 transition-colors ${
                    note.hasSymptom 
                      ? 'bg-rose-50/70 border-rose-150' 
                      : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xs font-extrabold bg-[#E2E8F0] text-[#475569] py-0.5 px-2 rounded-md">
                        {note.date}
                      </span>
                      {note.hasSymptom && (
                        <span className="bg-rose-100 text-rose-800 text-3xs font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-rose-800" />
                          <span>Med</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#1E293B] leading-relaxed break-words whitespace-pre-wrap text-left">
                      {note.text}
                    </p>
                  </div>

                  <button
                    id={`delete-note-btn-${note.id}`}
                    onClick={() => onDeleteNote(note.id)}
                    className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors"
                    title="Cancella nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
