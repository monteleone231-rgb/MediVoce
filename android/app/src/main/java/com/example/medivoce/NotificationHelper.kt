package com.example.medivoce

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import androidx.core.app.NotificationCompat

private const val TAG = "NotificationHelper"

/**
 * Helper to trigger high-priority alerts with Full-Screen intent.
 * Forces the screen to illuminate and starts a continuous ringing sound.
 */
class NotificationHelper(context: Context) {

    private val appContext = context.applicationContext
    private val notificationManager = requireNotNull(appContext.getSystemService(NotificationManager::class.java)) {
        "NotificationManager service not available"
    }
    private var mediaPlayer: MediaPlayer? = null

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .build()

        val channel = NotificationChannel(
            CHANNEL_ID,
            CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Notifiche ad alta priorità per l'assunzione indispensabile di medicine."
            enableLights(true)
            enableVibration(true)
            // Set custom or default alarm sound for the channel itself
            setSound(Uri.parse("android.resource://${appContext.packageName}/raw/alarm_sound"), audioAttributes)
        }
        notificationManager.createNotificationChannel(channel)
    }

    /**
     * Shows full screen notification and triggers loops of ringtones.
     */
    fun showCriticalNotification(alarmId: Int, medicineName: String): Notification {
        val fullScreenIntent = Intent(appContext, FullScreenAlertActivity::class.java).apply {
            putExtra(MedicationAlertService.EXTRA_MEDICINE_NAME, medicineName)
            putExtra(MedicationAlertService.EXTRA_ALARM_ID, alarmId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        // PendingIntent to launch the Full-Screen activity overlay immediately
        val fullScreenPendingIntent = PendingIntent.getActivity(
            appContext,
            alarmId,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Standard notification action (Dismiss)
        val dismissIntent = Intent(appContext, AlarmReceiver::class.java).apply {
            action = ACTION_DISMISS_ALARM
            putExtra(MedicationAlertService.EXTRA_ALARM_ID, alarmId)
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            appContext,
            alarmId,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build high priority notification
        val builder = NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Prendi la tua medicina: $medicineName")
            .setContentText("Ora di prendere il farmaco pianificato. Tocca per confermare.")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(fullScreenPendingIntent, true) // Crucial line to wake screen
            .setAutoCancel(false)
            .setOngoing(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Rimanda", dismissPendingIntent)

        val notification = builder.build()

        // Launch alert notification
        notificationManager.notify(alarmId, notification)

        // Start playing continuous loop sound
        playAlarmSound()

        return notification
    }

    private fun playAlarmSound() {
        try {
            stopAlarmSound()
            // Pull standard system alarm ringtone or standard resource
            val alertUri = Uri.parse("android.resource://${appContext.packageName}/raw/alarm_sound")
            mediaPlayer = MediaPlayer().apply {
                setDataSource(appContext, alertUri)
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                isLooping = true
                prepare()
                start()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to play custom alarm sound, falling back to default system alarm", e)
            // Backup fallback is system default alarm ringtone
            try {
                val fallbackUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM)
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(appContext, fallbackUri)
                    isLooping = true
                    prepare()
                    start()
                }
            } catch (ex: Exception) {
                Log.e(TAG, "Failed to play fallback alarm sound", ex)
            }
        }
    }

    fun stopAlarmSound() {
        mediaPlayer?.apply {
            try {
                if (isPlaying) {
                    stop()
                }
            } catch (e: IllegalStateException) {
                Log.w(TAG, "MediaPlayer stop called in illegal state", e)
            } finally {
                release()
            }
        }
        mediaPlayer = null
    }

    companion object {
        private const val CHANNEL_ID = "medivoce_critical_reminders"
        private const val CHANNEL_NAME = "Promemoria Farmaci Critici"
        private const val ACTION_DISMISS_ALARM = "ACTION_DISMISS_ALARM"
    }
}

