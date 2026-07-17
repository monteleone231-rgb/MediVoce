package com.example.medivoceapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.Locale

class MedicationAlertService : Service(), TextToSpeech.OnInitListener {
    private var ringtone: Ringtone? = null
    private var tts: TextToSpeech? = null
    private var medName: String = "Medicina"

    companion object {
        private const val TAG = "MedicationAlertService"
        private const val NOTIFICATION_ID = 99999
        private const val CHANNEL_ID = "medivoce_alert_service_channel"
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")
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
        medName = intent?.getStringExtra("MED_NAME") ?: "Medicina"
        Log.d(TAG, "Service started for $medName")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Servizio Allarmi MediVoce",
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Allarme MediVoce attivo")
            .setContentText("Promemoria per: $medName")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        try {
            val alarmUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ringtone = RingtoneManager.getRingtone(this, alarmUri).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    audioAttributes = AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                }
                play()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error playing ringtone", e)
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
                        lang.lowercase().startsWith("it") -> "Attenzione, è l'ora di assumere il farmaco: $medName"
                        lang.lowercase().startsWith("es") -> "Atención, es hora de tomar el medicamento: $medName"
                        lang.lowercase().startsWith("fr") -> "Attention, c'est l'heure de prendre le médicament : $medName"
                        else -> "Attention, it is time to take your medication: $medName"
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
        super.onDestroy()
        Log.d(TAG, "Service destroyed")
        try {
            ringtone?.stop()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping ringtone", e)
        }
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TextToSpeech in Service", e)
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
