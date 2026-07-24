/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'it' | 'en' | 'es' | 'fr' | 'de';

export type MedicationCategory = 'pill' | 'capsule' | 'bottle' | 'liquid' | 'inhaler' | 'cream' | 'injection' | 'other';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM
  times?: string[]; // Multiple daily HH:MM schedules
  notes: string;
  category: MedicationCategory;
  weeklySchedule: number[]; // 0 for Sunday, 1 for Monday, etc.
  frequencyType?: 'weekly' | 'monthly';
  monthlyDay?: number; // 1 to 31 representing day of the month
  isActive: boolean;
  history: { [dateStr: string]: boolean }; // e.g. "2026-06-10": true (taken) or "2026-06-10_08:30": true
  audioTone: string; // 'preset_arpeggio' | 'preset_marimba' | 'preset_trillo'
  voicePrompt: string; // custom empathetic speech prompt
  nativeId?: number; // Unique 32-bit integer for Android AlarmManager
  stockCurrent?: number; // Current stock count (optional)
  stockMin?: number; // Threshold for low stock warning
  pillColor?: string; // Custom color accent for high-fidelity styling
}

export interface DoctorNote {
  id: string;
  date: string;
  text: string;
  hasSymptom: boolean;
}

export const TRANSLATIONS: Record<LanguageCode, {
  appName: string;
  onboardingTitle: string;
  selectLanguage: string;
  welcome: string;
  welcomeDescription: string;
  stepVoiceTitle: string;
  stepVoiceDesc: string;
  stepScanTitle: string;
  stepScanDesc: string;
  stepPharmaTitle: string;
  stepPharmaDesc: string;
  buttonNext: string;
  buttonBack: string;
  buttonFinish: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  greetingNight: string;
  addMedication: string;
  editMedication: string;
  medicationName: string;
  dosageLabel: string;
  timeLabel: string;
  instructionsLabel: string;
  categoryLabel: string;
  frequencyLabel: string;
  voiceMessageLabel: string;
  voiceMessagePlaceholder: string;
  save: string;
  cancel: string;
  confirmTaken: string;
  takenBtn: string;
  pendingBtn: string;
  speakAlert: string;
  testVoiceSettings: string;
  testVoiceBtn: string;
  testVoiceSuccess: string;
  voiceSpeed: string;
  voiceToneType: string;
  toneEmpathetic: string;
  toneFirm: string;
  ringtoneLabel: string;
  barcodeScanBtn: string;
  barcodeSuccess: string;
  barcodeScanPrompt: string;
  findPharmacyBtn: string;
  pharmacyTitle: string;
  pharmacyDistance: string;
  pharmacyOpen: string;
  historyTitle: string;
  historySubtitle: string;
  weeklyRate: string;
  notesTitle: string;
  notesSubtitle: string;
  notesPlaceholder: string;
  notesVoiceBtn: string;
  notesDoctorLabel: string;
  androidDocsBtn: string;
  noMedsToday: string;
  allDays: string;
  mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string;
  todayMedsTitle: string;
  todayMedsSubtitle: string;
  dailySummaryTitle: string;
  dailySummaryTaken: string;
  dailySummaryRemaining: string;
  cameraRequesting: string;
  cameraDenied: string;
  cameraSimulateBtn: string;
  scanningInProgress: string;
  barcodeMatching: string;
  barcodeScanAgain: string;
  vibrationSetting: string;
  themeSetting: string;
  themeColorSetting: string;
  themeBgSetting: string;
  defaultTheme: string;
  darkTheme: string;
  warmTheme: string;
  alwaysOnSetting: string;
  voiceAnnounceSetting: string;
  privacyPolicy: string;
  privacyText: string;
  medicalDisclaimer: string;
  devicePreferences: string;
  listenTutorialBtn: string;
  voiceTutorialText: string;
  toneEmpatheticActive: string;
  toneFirmActive: string;
  supportDevTitle: string;
  supportDevText: string;
  donateBtn: string;
  historyAndNotesHeader: string;
  historyAndNotesSub: string;
  monthlyDosageCalendar: string;
  howDoYouFeel: string;
  wellbeingSubtitle: string;
  shareReportTitle: string;
  shareReportSub: string;
  reportCopied: string;
  copyDailyReport: string;
  detailsFor: string;
  noMedsForDay: string;
  emergencyTitle: string;
  emergencySub: string;
  callNow: string;
  noNotesYet: string;
  perfectAdherenceMsg: string;
  monthlyStatsSub: string;
  takenStatus: string;
  pendingStatus: string;
  activeMedsLabel: string;
  inactiveMedsLabel: string;
  noActiveMeds: string;
  noInactiveMeds: string;
  searchMedPlaceholder: string;
  medicationManagementHeader: string;
  medicationManagementSub: string;
  tabToday: string;
  tabMeds: string;
  tabPharmacies: string;
  tabSetup: string;
}> = {
  it: {
    appName: "MediVoce",
    onboardingTitle: "Configurazione Iniziale",
    selectLanguage: "Seleziona la tua lingua:",
    welcome: "Benvenuto su MediVoce",
    welcomeDescription: "L'app amica, semplice e vocale progettata per aiutarti (o aiutare i tuoi cari) a ricordarsi di prendere le medicine con serenità e sicurezza.",
    stepVoiceTitle: "Promemoria Empatici",
    stepVoiceDesc: "L'app parla con te di giorno e di notte con una voce calma, lenta e chiara. Puoi confermare l'assunzione dicendo 'Preso' o premendo un grande tasto.",
    stepScanTitle: "Suoni del Dispositivo",
    stepScanDesc: "Personalizza i tuoi allarmi caricando i tuoi file preferiti o importando direttamente le suonerie e i suoni di notifica originali del tuo telefono.",
    stepPharmaTitle: "Farmacie Aperte Vicine",
    stepPharmaDesc: "Se hai bisogno urgente di un farmaco, c'è un tasto rapido che localizza all'istante le farmacie aperte più vicine a te.",
    buttonNext: "Avanti",
    buttonBack: "Indietro",
    buttonFinish: "Fine",
    greetingMorning: "Buongiorno",
    greetingAfternoon: "Buon pomeriggio",
    greetingEvening: "Buonasera",
    greetingNight: "Buonanotte",
    addMedication: "Aggiungi Farmaco",
    editMedication: "Modifica Farmaco",
    medicationName: "Nome del Farmaco",
    dosageLabel: "Dosaggio (es. 1 compressa, 5ml)",
    timeLabel: "Orario di assunzione",
    instructionsLabel: "Note speciali (es. a stomaco pieno, prima di dormire)",
    categoryLabel: "Tipo di medicina",
    frequencyLabel: "Giorni di assunzione",
    voiceMessageLabel: "Messaggio vocale personalizzato (opzionale)",
    voiceMessagePlaceholder: "Es: Ricordati di prendere la pastiglia gialla con un bel bicchiere d'acqua.",
    save: "Salva",
    cancel: "Annulla",
    confirmTaken: "Hai preso la medicina?",
    takenBtn: "Presa",
    pendingBtn: "CONFERMA",
    speakAlert: "Sveglia Vocale",
    testVoiceSettings: "Impostazioni e Prova Voce",
    testVoiceBtn: "Ascolta Prova Voce",
    testVoiceSuccess: "Voce configurata correttamente! Come ti sembra il tono?",
    voiceSpeed: "Velocità della Voce (Consigliata Bassa per anziani)",
    voiceToneType: "Tono della Voce",
    toneEmpathetic: "Empatico e Caldo ✨",
    toneFirm: "Deciso e Rassicurante 🔔",
    ringtoneLabel: "Suono / Notifica di Allarme",
    barcodeScanBtn: "Fotocamera (Inquadra Codice)",
    barcodeSuccess: "Farmaco scansionato con successo!",
    barcodeScanPrompt: "Posiziona il codice a barre del farmaco davanti alla fotocamera per rilevarlo in automatico.",
    findPharmacyBtn: "Trova Farmacie Aperte Vicine",
    pharmacyTitle: "Mappa e Farmacie di Turno",
    pharmacyDistance: "Distanza",
    pharmacyOpen: "Aperta Ora",
    historyTitle: "Cronologia Settimanale",
    historySubtitle: "Traccia la costanza della tua salute",
    weeklyRate: "Tasso di aderenza di questa settimana",
    notesTitle: "Registro delle Note Mediche",
    notesSubtitle: "Scrivi sintomi, effetti collaterali o appunti per il medico",
    notesPlaceholder: "Scrivi qui o premi il microfono per dettare con la voce...",
    notesVoiceBtn: "Dettatura Vocale",
    notesDoctorLabel: "Segnala come sintomo importante",
    androidDocsBtn: "Codice Android AlarmManager (Dev)",
    noMedsToday: "Nessuna medicina programmata per oggi. Ottimo!",
    allDays: "Tutti i giorni",
    mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat: "Sab", sun: "Dom",
    todayMedsTitle: "Farmaci di Oggi",
    todayMedsSubtitle: "Controlla e conferma le dosi",
    dailySummaryTitle: "Riepilogo Giornaliero",
    dailySummaryTaken: "Assunti",
    dailySummaryRemaining: "Rimanenti",
    cameraRequesting: "Richiesta autorizzazione fotocamera in corso...",
    cameraDenied: "Impossibile accedere alla fotocamera. Assicurati di aver consentito l'accesso o usa il simulatore.",
    cameraSimulateBtn: "Simula Scansione Rapida (Offline)",
    scanningInProgress: "Scansione...",
    barcodeMatching: "Associazione riuscita! Compilazione automatica in corso...",
    barcodeScanAgain: "Scansiona ancora",
    vibrationSetting: "Vibrazione",
    themeSetting: "Tema e Colore Sfondo",
    themeColorSetting: "Colore del Tema (Tasti)",
    themeBgSetting: "Stile dello Sfondo",
    defaultTheme: "Chiaro",
    darkTheme: "Scuro",
    warmTheme: "Caldo",
    alwaysOnSetting: "Display Attivo alla Notifica",
    voiceAnnounceSetting: "Notifiche Vocali Attive (Sintesi Vocale)",
    privacyPolicy: "Informativa sulla Privacy",
    privacyText: "Privacy Policy Lineare: L'app opera esclusivamente in modalità locale, non ha database remoti e non traccia in alcun modo le abitudini dell'utente.",
    medicalDisclaimer: "Attenzione: Quest'app è solo un promemoria e non sostituisce in alcun modo il parere, la diagnosi o il consiglio del proprio medico curante o del farmacista.",
    devicePreferences: "Preferenze Dispositivo",
    listenTutorialBtn: "Ascolta Tutorial Vocale",
    voiceTutorialText: "Benvenuto nel tutorial. Quando senti l'avviso della medicina, puoi dire 'Sì' o 'Preso' per confermare l'assunzione. Oppure puoi toccare il pulsante rosso sullo schermo per rimandare l'allarme di qualche minuto.",
    toneEmpatheticActive: "Tono empatico attivato",
    toneFirmActive: "Tono deciso attivato",
    supportDevTitle: "Supporta lo Sviluppatore",
    supportDevText: "Se trovi utile questa app e vuoi aiutarmi a mantenerla gratuita e senza pubblicità, puoi offrirmi un caffè!",
    donateBtn: "Dona 1,99€",
    historyAndNotesHeader: "Cronologia & Note",
    historyAndNotesSub: "Aderenza settimanale e diario sintomi",
    monthlyDosageCalendar: "Calendario Dosi Mensile",
    howDoYouFeel: "Come ti senti oggi?",
    wellbeingSubtitle: "Stato di salute e condivisione",
    shareReportTitle: "Invia Report al Caregiver",
    shareReportSub: "Crea un report di oggi con medicinali presi, sintomi e livello di benessere pronto da inviare su WhatsApp o SMS.",
    reportCopied: "Report Copiato!",
    copyDailyReport: "Copia Report Giornaliero",
    detailsFor: "Dettaglio di ",
    noMedsForDay: "Nessuna medicina programmata per questo giorno.",
    emergencyTitle: "Emergenza",
    emergencySub: "Imposta il numero per chiamare un parente o il soccorso in caso di emergenza.",
    callNow: "Chiama Ora",
    noNotesYet: "Ancora nessun appunto inserito nel registro.",
    perfectAdherenceMsg: "Aderenza perfetta o dati in calcolo per il mese.",
    monthlyStatsSub: "Questi dati includono il calcolo mensile basato sull'attività recente.",
    takenStatus: "Presa",
    pendingStatus: "Salto",
    activeMedsLabel: "Attivi",
    inactiveMedsLabel: "Disattivati",
    noActiveMeds: "Nessun farmaco attivo.",
    noInactiveMeds: "Nessun farmaco disattivato.",
    searchMedPlaceholder: "Cerca farmaco...",
    medicationManagementHeader: "Gestione Farmaci",
    medicationManagementSub: "Attiva/disattiva e organizza",
    tabToday: "Oggi",
    tabMeds: "Farmaci",
    tabPharmacies: "Farmacie",
    tabSetup: "Setup",
  },
  en: {
    appName: "MediVoce",
    onboardingTitle: "Initial Configuration",
    selectLanguage: "Select your language:",
    welcome: "Welcome to MediVoce",
    welcomeDescription: "A friendly, simple, and vocal app designed to help you (or your loved ones) take medications safely, easily, and with peace of mind.",
    stepVoiceTitle: "Empathetic Reminders",
    stepVoiceDesc: "The app talks to you day and night with a calm, slow, and clear voice. You can confirm by saying 'Taken' or touching a giant button.",
    stepScanTitle: "Custom Device Sounds",
    stepScanDesc: "Personalize your alerts by uploading your favorite sounds or directly importing your phone's original ringtones and notification sounds.",
    stepPharmaTitle: "Find Open Pharmacies",
    stepPharmaDesc: "Need a medication urgently? One tap lists all open and nearby pharmacies with easy navigation directions.",
    buttonNext: "Next",
    buttonBack: "Back",
    buttonFinish: "Finish",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingNight: "Good night",
    addMedication: "Add Medication",
    editMedication: "Edit Medication",
    medicationName: "Medication Name",
    dosageLabel: "Dosage (e.g., 1 pill, 5ml)",
    timeLabel: "Intake Time",
    instructionsLabel: "Special notes (e.g., with meals, before bed)",
    categoryLabel: "Medication Type",
    frequencyLabel: "Schedule Days",
    voiceMessageLabel: "Custom Voice Message (optional)",
    voiceMessagePlaceholder: "E.g., Please remember to take the red capsule with a full glass of water.",
    save: "Save",
    cancel: "Cancel",
    confirmTaken: "Have you taken your medicine?",
    takenBtn: "Taken",
    pendingBtn: "Pending",
    speakAlert: "Vocal Alert",
    testVoiceSettings: "Settings & Voice Test",
    testVoiceBtn: "Listen to Voice Test",
    testVoiceSuccess: "Voice configured properly! How do you like this tone?",
    voiceSpeed: "Voice Speed (Low speed recommended for elderly)",
    voiceToneType: "Voice Character",
    toneEmpathetic: "Warm & Caring ✨",
    toneFirm: "Firm & Clear 🔔",
    ringtoneLabel: "Alarm Ringtone / Alert Sound",
    barcodeScanBtn: "Camera Barcode Scanner",
    barcodeSuccess: "Barcode scanned successfully!",
    barcodeScanPrompt: "Align the pharmaceutical barcode inside the preview area to scan automatically.",
    findPharmacyBtn: "Search Nearby Open Pharmacies",
    pharmacyTitle: "On-Duty Pharmacy Finder",
    pharmacyDistance: "Distance",
    pharmacyOpen: "Open Now",
    historyTitle: "Weekly Health History",
    historySubtitle: "Keep track of your health consistency",
    weeklyRate: "Adherence rate this week",
    notesTitle: "Medical Intake Logs & Notes",
    notesSubtitle: "Write symptoms, side-effects or questions for your doctor",
    notesPlaceholder: "Type notes here or tap the microphone to speak...",
    notesVoiceBtn: "Voice Input",
    notesDoctorLabel: "Mark as important symptom",
    androidDocsBtn: "Android AlarmManager Code (Dev)",
    noMedsToday: "No medications scheduled for today. Great!",
    allDays: "Every day",
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
    todayMedsTitle: "Today's Medications",
    todayMedsSubtitle: "Check and confirm your doses",
    dailySummaryTitle: "Daily Summary",
    dailySummaryTaken: "Taken",
    dailySummaryRemaining: "Remaining",
    cameraRequesting: "Requesting camera authorization...",
    cameraDenied: "Unable to access the camera. Make sure you have allowed access or use the simulator.",
    cameraSimulateBtn: "Simulate Fast Scan (Offline)",
    scanningInProgress: "Scanning...",
    barcodeMatching: "Match found! Auto-filling details...",
    barcodeScanAgain: "Scan again",
    vibrationSetting: "Vibration",
    themeSetting: "Background Color & Theme",
    themeColorSetting: "Theme Accent Color",
    themeBgSetting: "Background Style",
    defaultTheme: "Light",
    darkTheme: "Dark",
    warmTheme: "Warm",
    alwaysOnSetting: "Keep Display On for Notifications",
    voiceAnnounceSetting: "Enable Voice Announcements (Text-to-Speech)",
    privacyPolicy: "Privacy Policy",
    privacyText: "Linear Privacy Policy: The app operates entirely locally, has no remote databases, and does not track user habits in any way.",
    medicalDisclaimer: "Warning: This app is solely a reminder tool and does not substitute medical or pharmacological advice, diagnosis, or recommendations.",
    devicePreferences: "Device Preferences",
    listenTutorialBtn: "Listen to Voice Tutorial",
    voiceTutorialText: "Welcome to the tutorial. When you hear the medicine alert, say 'Yes' or 'Taken' to confirm. Or, you can tap the red button on the screen to snooze the alarm for a few minutes.",
    toneEmpatheticActive: "Empathetic tone active",
    toneFirmActive: "Firm tone active",
    supportDevTitle: "Support the Developer",
    supportDevText: "If you find this app helpful and want to help me keep it free and without ads, consider buying me a coffee!",
    donateBtn: "Donate €1.99",
    historyAndNotesHeader: "Adherence & Notes",
    historyAndNotesSub: "Weekly adherence and symptom journal",
    monthlyDosageCalendar: "Monthly Dosage Calendar",
    howDoYouFeel: "How do you feel today?",
    wellbeingSubtitle: "Well-being & caregiver report",
    shareReportTitle: "Share Report with Caregiver",
    shareReportSub: "Creates a summary of today's medications, symptoms, and well-being ready to send via WhatsApp or SMS.",
    reportCopied: "Report Copied!",
    copyDailyReport: "Copy Daily Report",
    detailsFor: "Details for ",
    noMedsForDay: "No medications scheduled for this day.",
    emergencyTitle: "Emergency",
    emergencySub: "Set the number to reach a relative or emergency services in an emergency.",
    callNow: "Call Now",
    noNotesYet: "No notes recorded yet.",
    perfectAdherenceMsg: "Perfect adherence or calculating monthly data.",
    monthlyStatsSub: "Monthly statistics are calculated from recent activity.",
    takenStatus: "Taken",
    pendingStatus: "Pending",
    activeMedsLabel: "Active",
    inactiveMedsLabel: "Inactive",
    noActiveMeds: "No active medications.",
    noInactiveMeds: "No inactive medications.",
    searchMedPlaceholder: "Search medication...",
    medicationManagementHeader: "Medication Management",
    medicationManagementSub: "Toggle and organize",
    tabToday: "Today",
    tabMeds: "Meds",
    tabPharmacies: "Pharmacies",
    tabSetup: "Setup",
  },
  es: {
    appName: "MediVoce",
    onboardingTitle: "Configuración Inicial",
    selectLanguage: "Selecciona tu idioma:",
    welcome: "Bienvenido a MediVoce",
    welcomeDescription: "La aplicación amigable, sencilla y hablada diseñada para ayudarte a recordar tomar tus medicinas de forma segura y sin estrés.",
    stepVoiceTitle: "Recordatorios Empáticos",
    stepVoiceDesc: "La aplicación le habla de día y de noche con voz pausada y clara. Confirma la dosis diciendo 'Tomada' o pulsando un gran botón.",
    stepScanTitle: "Sonidos del Dispositivo",
    stepScanDesc: "Personaliza tus alertas subiendo tus archivos favoritos o importando directamente los tonos de llamada y de notificación de tu propio teléfono.",
    stepPharmaTitle: "Farmacias Abiertas Cercanas",
    stepPharmaDesc: "Si tienes una urgencia médica, un botón rápido te dirá las farmacias locales abiertas y de turno más cercanas.",
    buttonNext: "Siguiente",
    buttonBack: "Atrás",
    buttonFinish: "Finalizar",
    greetingMorning: "Buenos días",
    greetingAfternoon: "Buenas tardes",
    greetingEvening: "Buenas noches",
    greetingNight: "Buenas noches",
    addMedication: "Añadir Medicina",
    editMedication: "Editar Medicina",
    medicationName: "Nombre del Medicamento",
    dosageLabel: "Dosis (ej. 1 tableta, 10ml)",
    timeLabel: "Hora de toma",
    instructionsLabel: "Notas especiales (ej. después de comer, antes de acostarse)",
    categoryLabel: "Formato",
    frequencyLabel: "Días de dosis",
    voiceMessageLabel: "Mensaje de voz personalizado (opcional)",
    voiceMessagePlaceholder: "Ej: Recuerde tomar la pastilla pequeña antes de cenar.",
    save: "Guardar",
    cancel: "Cancelar",
    confirmTaken: "¿Se ha tomado el medicamento?",
    takenBtn: "Tomado",
    pendingBtn: "Pendiente",
    speakAlert: "Alerta de Voz",
    testVoiceSettings: "Configuración y Prueba de Voz",
    testVoiceBtn: "Escuchar Prueba de Voz",
    testVoiceSuccess: "¡Voz configurada correctamente! ¿Qué tal se oye el tono?",
    voiceSpeed: "Velocidad de Voz (Baja recomendada para mayores)",
    voiceToneType: "Tono de Voz",
    toneEmpathetic: "Empático y Cálido ✨",
    toneFirm: "Firme y Decidido 🔔",
    ringtoneLabel: "Tono / Sonido de Alerta",
    barcodeScanBtn: "Detector de Códigos",
    barcodeSuccess: "¡Medicamento escaneado correctamente!",
    barcodeScanPrompt: "Coloque el código de barras de la caja frente a la cámara para escanearlo.",
    findPharmacyBtn: "Buscar Farmacias de Turno Cercanas",
    pharmacyTitle: "Buscador de Farmacias de Turno",
    pharmacyDistance: "Distancia",
    pharmacyOpen: "Abierto Ahora",
    historyTitle: "Registro de Adherencia Semanal",
    historySubtitle: "Sigue el progreso diario de tus tomas",
    weeklyRate: "Adherencia lograda esta semana",
    notesTitle: "Notas de Síntomas",
    notesSubtitle: "Escribe síntomas importantes o dudas para tu doctor",
    notesPlaceholder: "Escriba aquí o toque el micrófono para dictar con voz...",
    notesVoiceBtn: "Dictar Nota",
    notesDoctorLabel: "Marcar como síntoma relevante",
    androidDocsBtn: "Código Android AlarmManager (Dev)",
    noMedsToday: "No hay medicamentos programados para hoy. ¡Estupendo!",
    allDays: "Todos los días",
    mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom",
    todayMedsTitle: "Medicamentos de Hoy",
    todayMedsSubtitle: "Revisa y confirma las dosis",
    dailySummaryTitle: "Resumen Diario",
    dailySummaryTaken: "Tomados",
    dailySummaryRemaining: "Restantes",
    cameraRequesting: "Solicitando autorización de la cámara...",
    cameraDenied: "No se pudo acceder a la cámara. Asegúrate de haber permitido el acceso o usa el simulador.",
    cameraSimulateBtn: "Simular Escaneo Rápido (Offline)",
    scanningInProgress: "Escaneando...",
    barcodeMatching: "¡Asociación exitosa! Auto-completando...",
    barcodeScanAgain: "Escanear de nuevo",
    vibrationSetting: "Vibración",
    themeSetting: "Color de Fondo y Tema",
    themeColorSetting: "Color de Acentos (Tema)",
    themeBgSetting: "Estilo de Fondo",
    defaultTheme: "Claro",
    darkTheme: "Oscuro",
    warmTheme: "Cálido",
    alwaysOnSetting: "Mantener Pantalla Encendida para Notificaciones",
    voiceAnnounceSetting: "Habilitar Anuncios Vocales (Síntesis de Voz)",
    privacyPolicy: "Política de Privacidad",
    privacyText: "Política de Privacidad Lineal: La aplicación funciona exclusivamente en modo local, no tiene bases de datos remotas y no rastrea los hábitos del usuario.",
    medicalDisclaimer: "Advertencia: Esta aplicación es solo un recordatorio y no sustituye de ninguna manera el consejo, diagnóstico o recomendación de un médico o farmacéutico.",
    devicePreferences: "Preferencias del Dispositivo",
    listenTutorialBtn: "Escuchar Tutorial de Voz",
    voiceTutorialText: "Bienvenido al tutorial. Cuando escuche la alerta de la medicina, diga 'Sí' o 'Tomado' para confirmar. O bien, toque el botón rojo en la pantalla para posponer la alarma unos minutos.",
    toneEmpatheticActive: "Tono empático activado",
    toneFirmActive: "Tono firme activado",
    supportDevTitle: "Apoyar al Desarrollador",
    supportDevText: "Si encuentra útil esta aplicación y desea ayudarme a mantenerla gratuita y sin publicidad, ¡considere invitarme a un café!",
    donateBtn: "Donar 1,99 €",
    historyAndNotesHeader: "Historial y Notas",
    historyAndNotesSub: "Adherencia semanal y diario de síntomas",
    monthlyDosageCalendar: "Calendario Mensual de Dosis",
    howDoYouFeel: "¿Cómo te sientes hoy?",
    wellbeingSubtitle: "Estado de salud e informe para el cuidador",
    shareReportTitle: "Enviar Informe al Cuidador",
    shareReportSub: "Crea un informe de hoy con los medicamentos tomados, síntomas y nivel de bienestar listo para enviar por WhatsApp o SMS.",
    reportCopied: "¡Informe Copiado!",
    copyDailyReport: "Copiar Informe Diario",
    detailsFor: "Detalle de ",
    noMedsForDay: "No hay medicamentos programados para este día.",
    emergencyTitle: "Emergencia",
    emergencySub: "Configure el número para llamar a un familiar o a urgencias en caso de emergencia.",
    callNow: "Llamar Ahora",
    noNotesYet: "Aún no hay notas registradas.",
    perfectAdherenceMsg: "Adherencia perfecta o calculando datos del mes.",
    monthlyStatsSub: "Estos datos incluyen el cálculo mensual basado en la actividad reciente.",
    takenStatus: "Tomada",
    pendingStatus: "Pendiente",
    activeMedsLabel: "Activos",
    inactiveMedsLabel: "Desactivados",
    noActiveMeds: "No hay medicamentos activos.",
    noInactiveMeds: "No hay medicamentos desactivados.",
    searchMedPlaceholder: "Buscar medicamento...",
    medicationManagementHeader: "Gestión de Medicamentos",
    medicationManagementSub: "Activar/desactivar y organizar",
    tabToday: "Hoy",
    tabMeds: "Fármacos",
    tabPharmacies: "Farmacias",
    tabSetup: "Ajustes",
  },
  fr: {
    appName: "MediVoce",
    onboardingTitle: "Configuration Initiale",
    selectLanguage: "Choisissez votre langue :",
    welcome: "Bienvenue sur MediVoce",
    welcomeDescription: "L'application vocale simple et bienveillante conçue pour vous aider (ou vos aînés) à prendre vos traitements médicaux en toute sérénité.",
    stepVoiceTitle: "Rappels Empathiques",
    stepVoiceDesc: "L'application vous parle jour et nuit avec une voix calme, lente et audible. Validez d'un mot en disant 'Pris' ou d'un appui géant.",
    stepScanTitle: "Sons de l'Appareil",
    stepScanDesc: "Personnalisez vos alertes en téléchargeant vos sons favoris ou en important directement les sonneries et notifications d'origine de votre téléphone.",
    stepPharmaTitle: "Pharmacies Ouvertes Proches",
    stepPharmaDesc: "En cas d'urgence, un bouton d'assistance localise instantanément les pharmacies de garde ouvertes autour de vous.",
    buttonNext: "Suivant",
    buttonBack: "Retour",
    buttonFinish: "Terminer",
    greetingMorning: "Bonjour",
    greetingAfternoon: "Bon après-midi",
    greetingEvening: "Bonsoir",
    greetingNight: "Bonne nuit",
    addMedication: "Ajouter un Médicament",
    editMedication: "Modifier le Médicament",
    medicationName: "Nom de la Molécule",
    dosageLabel: "Posologie (ex: 1 gélule, 1 ampoule)",
    timeLabel: "Heure de prise",
    instructionsLabel: "Remarques (ex: au milieu du repas, à jeun)",
    categoryLabel: "Forme galénique",
    frequencyLabel: "Fréquence des jours",
    voiceMessageLabel: "Message vocal personnalisé (optionnel)",
    voiceMessagePlaceholder: "Ex: N'oublie pas de prendre ton pilulier rouge avec un grand verre d'eau.",
    save: "Enregistrer",
    cancel: "Annuler",
    confirmTaken: "Avez-vous pris votre médicament ?",
    takenBtn: "Pris",
    pendingBtn: "En attente",
    speakAlert: "Alerte Vocale",
    testVoiceSettings: "Paramètres & Test de Voix",
    testVoiceBtn: "Écouter le Test Vocal",
    testVoiceSuccess: "Voix configurée correctement ! Comment trouvez-vous cette intonation ?",
    voiceSpeed: "Vitesse d'élocution (Recommandé lent pour les aînés)",
    voiceToneType: "Tonalité de la Voix",
    toneEmpathetic: "Chaleureuse & Empathique ✨",
    toneFirm: "Douce mais Déterminée 🔔",
    ringtoneLabel: "Sonnerie de notification",
    barcodeScanBtn: "Lecteur Code-Barres",
    barcodeSuccess: "Médicament scanné avec succès !",
    barcodeScanPrompt: "Placez le code-barres de la boîte face à l'objectif pour une lecture rapide.",
    findPharmacyBtn: "Rechercher une Pharmacie de Garde",
    pharmacyTitle: "Pharmacies Ouvertes & de Garde",
    pharmacyDistance: "Distance",
    pharmacyOpen: "Ouvert Actuellement",
    historyTitle: "Historique Hebdomadaire",
    historySubtitle: "Consultez la régularité de vos prises",
    weeklyRate: "Taux d'adhésion pour cette semaine",
    notesTitle: "Journal de Notes Médicales",
    notesSubtitle: "Effets indésirables, symptômes ou notes pour le médecin",
    notesPlaceholder: "Saisissez vos remarques ou parlez en appuyant sur le micro...",
    notesVoiceBtn: "Saisie Vocale",
    notesDoctorLabel: "Signaler comme symptôme majeur",
    androidDocsBtn: "Code Android AlarmManager (Dev)",
    noMedsToday: "Aucun traitement prévu pour aujourd'hui. Parfait !",
    allDays: "Tous les jours",
    mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim",
    todayMedsTitle: "Traitements d'Aujourd'hui",
    todayMedsSubtitle: "Vérifiez et confirmez vos doses",
    dailySummaryTitle: "Résumé Quotidien",
    dailySummaryTaken: "Pris",
    dailySummaryRemaining: "Restants",
    cameraRequesting: "Demande d'autorisation de la caméra...",
    cameraDenied: "Impossible d'accéder à la caméra. Assurez-vous d'avoir autorisé l'accès ou utilisez le simulateur.",
    cameraSimulateBtn: "Simuler un Scan Rapide (Hors-ligne)",
    scanningInProgress: "Numérisation...",
    barcodeMatching: "Médicament identifié ! Saisie automatique en cours...",
    barcodeScanAgain: "Scanner à nouveau",
    vibrationSetting: "Vibration",
    themeSetting: "Couleur de Fond et Thème",
    themeColorSetting: "Couleur Thématique",
    themeBgSetting: "Style d'Arrière-plan",
    defaultTheme: "Clair",
    darkTheme: "Sombre",
    warmTheme: "Chaud",
    alwaysOnSetting: "Garder l'Écran Allumé pour les Notifications",
    voiceAnnounceSetting: "Activer les Rappels Vocaux (Synthèse Vocale)",
    privacyPolicy: "Politique de Confidentialité",
    privacyText: "Politique de Confidentialité Linéaire : L'application fonctionne exclusivement en mode local, n'a pas de bases de données distantes et ne suit pas les habitudes des utilisateurs.",
    medicalDisclaimer: "Avertissement : Cette application n'est qu'un simple rappel et ne remplace en aucun cas les conseils, diagnostics ou recommandations d'un médecin ou d'un pharmacien.",
    devicePreferences: "Préférences de l'Appareil",
    listenTutorialBtn: "Écouter le Tutoriel Vocal",
    voiceTutorialText: "Bienvenue dans le tutoriel. Lorsque vous entendez l'alerte du médicament, dites 'Oui' ou 'Pris' pour confirmer la prise. Ou appuyez sur le bouton rouge à l'écran pour reporter l'alarme de quelques minutes.",
    toneEmpatheticActive: "Tonalité empathique activée",
    toneFirmActive: "Tonalité ferme activée",
    supportDevTitle: "Soutenir le Développeur",
    supportDevText: "Si vous trouvez cette application utile et souhaitez m'aider à la maintenir gratuite et sans publicité, vous pouvez m'offrir un café !",
    donateBtn: "Faire un don de 1,99 €",
    historyAndNotesHeader: "Historique & Notes",
    historyAndNotesSub: "Observance hebdomadaire et journal des symptômes",
    monthlyDosageCalendar: "Calendrier Mensuel des Doses",
    howDoYouFeel: "Comment vous sentez-vous aujourd'hui ?",
    wellbeingSubtitle: "État de santé et rapport pour l'aidant",
    shareReportTitle: "Partager le Rapport avec l'Aidant",
    shareReportSub: "Crée un rapport d'aujourd'hui avec les médicaments pris, les symptômes et le niveau de bien-être prêt à être envoyé par WhatsApp ou SMS.",
    reportCopied: "Rapport Copié !",
    copyDailyReport: "Copier le Rapport Journalier",
    detailsFor: "Détails pour ",
    noMedsForDay: "Aucun médicament programmé pour ce jour.",
    emergencyTitle: "Urgence",
    emergencySub: "Définissez le numéro pour appeler un proche ou les secours en cas d'urgence.",
    callNow: "Appeler Maintenant",
    noNotesYet: "Aucune note enregistrée pour l'instant.",
    perfectAdherenceMsg: "Observance parfaite ou calcul des données mensuelles.",
    monthlyStatsSub: "Ces données incluent le calcul mensuel basé sur l'activité récente.",
    takenStatus: "Pris",
    pendingStatus: "En attente",
    activeMedsLabel: "Actifs",
    inactiveMedsLabel: "Désactivés",
    noActiveMeds: "Aucun médicament actif.",
    noInactiveMeds: "Aucun médicament désactivé.",
    searchMedPlaceholder: "Rechercher un médicament...",
    medicationManagementHeader: "Gestion des Médicaments",
    medicationManagementSub: "Activer/désactiver et organiser",
    tabToday: "Aujourd'hui",
    tabMeds: "Médicaments",
    tabPharmacies: "Pharmacies",
    tabSetup: "Réglages",
  },
  de: {
    appName: "MediVoce",
    onboardingTitle: "Ersteinrichtung",
    selectLanguage: "Wählen Sie Ihre Sprache:",
    welcome: "Willkommen bei MediVoce",
    welcomeDescription: "Die freundliche, einfache und sprechende App, die Ihnen (oder Ihren Angehörigen) hilft, Medikamente sicher, einfach und beruhigt einzunehmen.",
    stepVoiceTitle: "Einfühlsame Erinnerungen",
    stepVoiceDesc: "Die App spricht Tag und Nacht mit Ihnen mit einer ruhigen, langsamen und deutlichen Stimme. Sie können die Einnahme bestätigen, indem Sie 'Eingenommen' sagen oder eine riesige Taste drücken.",
    stepScanTitle: "Gerätetöne",
    stepScanDesc: "Personalisieren Sie Ihre Alarme, indem Sie Ihre Lieblingsdateien hochladen oder die Original-Klingeltöne und Benachrichtigungstöne Ihres Telefons direkt importieren.",
    stepPharmaTitle: "Offene Apotheken in der Nähe",
    stepPharmaDesc: "Wenn Sie dringend ein Medikament benötigen, zeigt Ihnen eine Schnellschaltfläche sofort die nächstgelegenen geöffneten Apotheken an.",
    buttonNext: "Weiter",
    buttonBack: "Zurück",
    buttonFinish: "Fertig",
    greetingMorning: "Guten Morgen",
    greetingAfternoon: "Guten Nachmittag",
    greetingEvening: "Guten Abend",
    greetingNight: "Gute Nacht",
    addMedication: "Medikament hinzufügen",
    editMedication: "Medikament bearbeiten",
    medicationName: "Name des Medikaments",
    dosageLabel: "Dosierung (z.B. 1 Tablette, 5ml)",
    timeLabel: "Einnahmezeit",
    instructionsLabel: "Besondere Hinweise (z.B. nach dem Essen, vor dem Schlafengehen)",
    categoryLabel: "Medikamententyp",
    frequencyLabel: "Einnahmetage",
    voiceMessageLabel: "Individuelle Sprachnachricht (optional)",
    voiceMessagePlaceholder: "Z.B.: Denken Sie daran, die gelbe Tablette mit einem großen Glas Wasser einzunehmen.",
    save: "Speichern",
    cancel: "Abbrechen",
    confirmTaken: "Haben Sie Ihr Medikament eingenommen?",
    takenBtn: "Eingenommen",
    pendingBtn: "BESTÄTIGEN",
    speakAlert: "Sprachalarm",
    testVoiceSettings: "Einstellungen & Sprachtest",
    testVoiceBtn: "Sprachtest anhören",
    testVoiceSuccess: "Stimme erfolgreich konfiguriert! Wie gefällt Ihnen dieser Ton?",
    voiceSpeed: "Sprechgeschwindigkeit (Niedrig empfohlen für Senioren)",
    voiceToneType: "Stimmencharakter",
    toneEmpathetic: "Einfühlsam & Warm ✨",
    toneFirm: "Bestimmt & Beruhigend 🔔",
    ringtoneLabel: "Alarmklingelton / Benachrichtigungston",
    barcodeScanBtn: "Kamera-Barcodescanner",
    barcodeSuccess: "Barcode erfolgreich gescannt!",
    barcodeScanPrompt: "Richten Sie den pharmazeutischen Barcode im Vorschaubereich aus, um ihn automatisch zu scannen.",
    findPharmacyBtn: "Geöffnete Apotheken in der Nähe suchen",
    pharmacyTitle: "Diensthabende Apotheken finden",
    pharmacyDistance: "Entfernung",
    pharmacyOpen: "Jetzt geöffnet",
    historyTitle: "Wöchentlicher Gesundheitsverlauf",
    historySubtitle: "Verfolgen Sie die Regelmäßigkeit Ihrer Einnahmen",
    weeklyRate: "Einnahmequote in dieser Woche",
    notesTitle: "Medizinische Notizen & Symptome",
    notesSubtitle: "Schreiben Sie Symptome, Nebenwirkungen oder Fragen für Ihren Arzt auf",
    notesPlaceholder: "Schreiben Sie hier oder tippen Sie auf das Mikrofon, um zu diktieren...",
    notesVoiceBtn: "Spracheingabe",
    notesDoctorLabel: "Als wichtiges Symptom markieren",
    androidDocsBtn: "Android AlarmManager Code (Dev)",
    noMedsToday: "Keine Medikamente für heute geplant. Großartig!",
    allDays: "Jeden Tag",
    mon: "Mon", tue: "Die", wed: "Mit", thu: "Don", fri: "Fre", sat: "Sam", sun: "Son",
    todayMedsTitle: "Heutige Medikamente",
    todayMedsSubtitle: "Überprüfen und bestätigen Sie Ihre Dosen",
    dailySummaryTitle: "Tägliche Zusammenfassung",
    dailySummaryTaken: "Eingenommen",
    dailySummaryRemaining: "Verbleibend",
    cameraRequesting: "Kamera-Freigabe wird angefordert...",
    cameraDenied: "Zugriff auf die Kamera nicht möglich. Stellen Sie sicher, dass Sie den Zugriff erlaubt haben oder verwenden Sie den Simulator.",
    cameraSimulateBtn: "Schnellen Scan simulieren (Offline)",
    scanningInProgress: "Scannen...",
    barcodeMatching: "Treffer gefunden! Details werden automatisch ausgefüllt...",
    barcodeScanAgain: "Erneut scannen",
    vibrationSetting: "Vibration",
    themeSetting: "Hintergrundfarbe & Design",
    themeColorSetting: "Design-Akzentfarbe",
    themeBgSetting: "Hintergrundstil",
    defaultTheme: "Hell",
    darkTheme: "Dunkel",
    warmTheme: "Warm",
    alwaysOnSetting: "Bildschirm bei Benachrichtigungen eingeschaltet lassen",
    voiceAnnounceSetting: "Sprachankündigungen aktivieren (Text-to-Speech)",
    privacyPolicy: "Datenschutzerklärung",
    privacyText: "Lineare Datenschutzerklärung: Die App läuft ausschließlich lokal, besitzt keine Online-Datenbanken und verfolgt die Gewohnheiten des Benutzers in keiner Weise.",
    medicalDisclaimer: "Warnung: Diese App dient ausschließlich als Erinnerungshilfe und ersetzt keinesfalls den Rat, die Diagnose oder die Empfehlung eines Arztes oder Apothekers.",
    devicePreferences: "Geräteeinstellungen",
    listenTutorialBtn: "Sprachanleitung anhören",
    voiceTutorialText: "Willkommen beim Tutorial. Wenn Sie den Medikamentenalarm hören, sagen Sie 'Ja' oder 'Eingenommen', um die Einnahme zu bestätigen. Oder tippen Sie auf die rote Taste auf dem Bildschirm, um den Alarm um einige Minuten zu verschieben.",
    toneEmpatheticActive: "Einfühlsamer Ton aktiviert",
    toneFirmActive: "Bestimmter Ton aktiviert",
    supportDevTitle: "Entwickler unterstützen",
    supportDevText: "Wenn Sie diese App nützlich finden und mir helfen möchten, sie kostenlos und werbefrei zu halten, können Sie mir einen Kaffee ausgeben!",
    donateBtn: "1,99 € spenden",
    historyAndNotesHeader: "Verlauf & Notizen",
    historyAndNotesSub: "Wöchentliche Einnahme und Symptomtagebuch",
    monthlyDosageCalendar: "Monatlicher Dosiskalender",
    howDoYouFeel: "Wie fühlen Sie sich heute?",
    wellbeingSubtitle: "Wohlbefinden & Pflegebericht",
    shareReportTitle: "Bericht an Pflegeperson senden",
    shareReportSub: "Erstellt einen heutigen Bericht mit eingenommenen Medikamenten, Symptomen und Wohlbefinden zum Senden per WhatsApp oder SMS.",
    reportCopied: "Bericht kopiert!",
    copyDailyReport: "Tagesbericht kopieren",
    detailsFor: "Details für ",
    noMedsForDay: "Für diesen Tag sind keine Medikamente geplant.",
    emergencyTitle: "Notfall",
    emergencySub: "Legen Sie die Nummer fest, um im Notfall Angehörige oder den Rettungsdienst anzurufen.",
    callNow: "Jetzt Anrufen",
    noNotesYet: "Noch keine Notizen im Tagebuch.",
    perfectAdherenceMsg: "Perfekte Einnahme oder Berechnung der Monatsdaten.",
    monthlyStatsSub: "Diese Daten enthalten die monatliche Berechnung basierend auf der letzten Aktivität.",
    takenStatus: "Eingenommen",
    pendingStatus: "Offen",
    activeMedsLabel: "Aktiv",
    inactiveMedsLabel: "Inaktiv",
    noActiveMeds: "Keine aktiven Medikamente.",
    noInactiveMeds: "Keine inaktiven Medikamente.",
    searchMedPlaceholder: "Medikament suchen...",
    medicationManagementHeader: "Medikamentenverwaltung",
    medicationManagementSub: "Aktivieren/deaktivieren und organisieren",
    tabToday: "Heute",
    tabMeds: "Medikamente",
    tabPharmacies: "Apotheken",
    tabSetup: "Einstellungen",
  }
};
