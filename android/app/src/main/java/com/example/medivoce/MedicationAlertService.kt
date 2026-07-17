package com.example.medivoce

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

private const val TAG = "MedicationAlertService"

class MedicationAlertService : Service(), TextToSpeech.OnInitListener {

    private lateinit var notificationHelper: NotificationHelper
    private var tts: TextToSpeech? = null
    private var medicineName: String = DEFAULT_MEDICINE_NAME

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "onCreate: Initializing MedicationAlertService")
        notificationHelper = NotificationHelper(applicationContext)
        try {
            // Try com.google.android.tts first, then fallback to default
            tts = TextToSpeech(applicationContext, this, "com.google.android.tts")
        } catch (e: Exception) {
            try {
                tts = TextToSpeech(applicationContext, this)
            } catch (e2: Exception) {
                Log.e(TAG, "Error creating TextToSpeech", e2)
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        medicineName = intent?.getStringExtra(EXTRA_MEDICINE_NAME) ?: DEFAULT_MEDICINE_NAME
        val alarmId = intent?.getIntExtra(EXTRA_ALARM_ID, DEFAULT_ALARM_ID) ?: DEFAULT_ALARM_ID

        Log.i(TAG, "onStartCommand: Triggering critical notification for $medicineName ($alarmId)")

        // Use helper to show the notification and start the alarm ringtone loop
        val notification = notificationHelper.showCriticalNotification(alarmId, medicineName)
        
        // Promote this service to the foreground with Android 14+ type safety where required
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(alarmId, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(alarmId, notification)
        }

        // Also proactively launch the Full-Screen activity overlay to draw over lockscreen
        val activityIntent = Intent(this, FullScreenAlertActivity::class.java).apply {
            putExtra(EXTRA_MEDICINE_NAME, medicineName)
            putExtra(EXTRA_ALARM_ID, alarmId)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        
        try {
            startActivity(activityIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start FullScreenAlertActivity from service context", e)
        }

        return START_STICKY
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val prefs = getSharedPreferences("MediVocePrefs", Context.MODE_PRIVATE)
            val lang = prefs.getString("lang", "it") ?: "it"
            val voiceEnabled = prefs.getBoolean("voiceEnabled", true)
            val speed = prefs.getFloat("speed", 0.75f)
            val tone = prefs.getString("tone", "empathetic") ?: "empathetic"

            if (voiceEnabled) {
                try {
                    val locale = when {
                        lang.lowercase().startsWith("it") -> Locale.ITALY
                        lang.lowercase().startsWith("es") -> Locale("es", "ES")
                        lang.lowercase().startsWith("fr") -> Locale.FRANCE
                        else -> Locale.US
                    }
                    tts?.language = locale
                    tts?.setSpeechRate(speed)
                    tts?.setPitch(if (tone == "empathetic") 1.2f else 1.0f)

                    val textToSpeak = when {
                        lang.lowercase().startsWith("it") -> "Attenzione, è l'ora di assumere il farmaco: $medicineName"
                        lang.lowercase().startsWith("es") -> "Atención, es hora de tomar el medicamento: $medicineName"
                        lang.lowercase().startsWith("fr") -> "Attention, c'est l'heure de prendre le médicament : $medicineName"
                        else -> "Attention, it is time to take your medication: $medicineName"
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        val params = Bundle().apply {
                            putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
                        }
                        tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, params, "medivoce_alert_speech")
                    } else {
                        @Suppress("DEPRECATION")
                        tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null)
                    }
                    Log.d(TAG, "Native alert speaking: $textToSpeak")
                } catch (e: Exception) {
                    Log.e(TAG, "Error speaking natively in service", e)
                }
            }
        } else {
            Log.e(TAG, "Failed to initialize TextToSpeech in Service")
        }
    }

    override fun onDestroy() {
        Log.d(TAG, "onDestroy: Shutting down alert service and cleaning up MediaPlayer resources")
        // Stop any playing sound loop when service is dismissed
        notificationHelper.stopAlarmSound()
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TextToSpeech in Service", e)
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val EXTRA_MEDICINE_NAME = "MEDICINE_NAME"
        const val EXTRA_ALARM_ID = "ALARM_ID"
        private const val DEFAULT_MEDICINE_NAME = "Medicina"
        private const val DEFAULT_ALARM_ID = 100
    }
}

