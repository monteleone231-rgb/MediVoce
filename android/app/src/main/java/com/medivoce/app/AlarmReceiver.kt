package com.medivoce.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "AlarmReceiver"
        private const val WAKELOCK_TIMEOUT_MS = 60000L // 1 minute
    }

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra("ALARM_ID", -1)
        val name = intent.getStringExtra("MED_NAME") ?: "Medicina"

        Log.d(TAG, "Alarm triggered! ID: $id, Name: $name")

        context.runWithWakeLock("medivoce::AlarmWakeLockTag", WAKELOCK_TIMEOUT_MS) {
            // Start the MedicationAlertService to play alert audio
            val serviceIntent = Intent(context, MedicationAlertService::class.java).apply {
                putExtra("ALARM_ID", id)
                putExtra("MED_NAME", name)
            }
            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start MedicationAlertService", e)
            }

            // Trigger visual overlay notification with FullScreenIntent
            NotificationHelper.showNotification(context, id, name)
        }
    }
}

inline fun Context.runWithWakeLock(tag: String, timeout: Long, block: () -> Unit) {
    val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
    val wakeLock = powerManager?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, tag)
    try {
        wakeLock?.acquire(timeout)
        block()
    } finally {
        if (wakeLock?.isHeld == true) {
            wakeLock.release()
        }
    }
}
