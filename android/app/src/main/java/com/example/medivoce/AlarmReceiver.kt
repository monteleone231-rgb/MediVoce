package com.example.medivoce

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

private const val TAG = "AlarmReceiver"

/**
 * BroadcastReceiver triggered by AlarmManager.
 * Uses a partial WakeLock to guarantee the CPU does not slip back into Standby
 * while preparing the high-priority fullscreen audio reminder.
 */
class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val alarmId = intent.getIntExtra(MedicationAlertService.EXTRA_ALARM_ID, DEFAULT_ALARM_ID)
        val medicineName = intent.getStringExtra(MedicationAlertService.EXTRA_MEDICINE_NAME) ?: DEFAULT_MEDICINE_NAME

        Log.d(TAG, "onReceive: received action=$action, alarmId=$alarmId, medicineName=$medicineName")

        if (action == ACTION_DISMISS_ALARM) {
            handleDismissAlarm(context, alarmId, medicineName)
            return
        }

        // Acquire a transient WakeLock type-safely to ensure execution is not killed before the Service/Activity launches
        context.runWithWakeLock("medivoce::AlarmWakeLockTag", WAKELOCK_TIMEOUT_MS) {
            val serviceIntent = Intent(context, MedicationAlertService::class.java).apply {
                putExtra(MedicationAlertService.EXTRA_MEDICINE_NAME, medicineName)
                putExtra(MedicationAlertService.EXTRA_ALARM_ID, alarmId)
            }

            try {
                Log.d(TAG, "Starting MedicationAlertService for $medicineName ($alarmId)")
                context.startForegroundService(serviceIntent)
            } catch (e: Exception) {
                Log.w(TAG, "Failed to start foreground service. Falling back to direct activity launch.", e)
                // Fallback to direct Activity startup if Service startup is constrained (e.g., background execution limits)
                val activityIntent = Intent(context, FullScreenAlertActivity::class.java).apply {
                    putExtra(MedicationAlertService.EXTRA_MEDICINE_NAME, medicineName)
                    putExtra(MedicationAlertService.EXTRA_ALARM_ID, alarmId)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                context.startActivity(activityIntent)
            }
        }
    }

    private fun handleDismissAlarm(context: Context, alarmId: Int, medicineName: String) {
        Log.i(TAG, "Dismissing alarm $alarmId for $medicineName")
        
        // 1. Stop the foreground alert service (stops music playback and service lifecycle)
        val serviceIntent = Intent(context, MedicationAlertService::class.java)
        context.stopService(serviceIntent)

        // 2. Explicitly dismiss the notification to ensure UI is in sync
        val notificationManager = context.getSystemService(NotificationManager::class.java)
        notificationManager?.cancel(alarmId)
    }

    private inline fun Context.runWithWakeLock(tag: String, timeoutMs: Long, block: () -> Unit) {
        val powerManager = getSystemService(PowerManager::class.java)
        if (powerManager == null) {
            Log.w(TAG, "PowerManager not available, running block without WakeLock")
            block()
            return
        }

        val wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, tag)
        try {
            wakeLock?.acquire(timeoutMs)
            block()
        } catch (e: Exception) {
            Log.e(TAG, "Error executing block with WakeLock", e)
        } finally {
            if (wakeLock?.isHeld == true) {
                try {
                    wakeLock.release()
                } catch (e: RuntimeException) {
                    Log.e(TAG, "Error releasing WakeLock", e)
                }
            }
        }
    }

    companion object {
        const val ACTION_DISMISS_ALARM = "ACTION_DISMISS_ALARM"
        private const val DEFAULT_MEDICINE_NAME = "Medicina"
        private const val DEFAULT_ALARM_ID = 100
        private const val WAKELOCK_TIMEOUT_MS = 10000L
    }
}

