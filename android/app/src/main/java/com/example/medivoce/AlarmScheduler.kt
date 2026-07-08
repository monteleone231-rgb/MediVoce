package com.example.medivoce

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.widget.Toast

private const val TAG = "AlarmScheduler"

/**
 * Android Alarm Manager scheduler for precision wakeups in MediVoce.
 * Activates precise medical timers, triggering alarms even in low-power stand-by (Doze Mode).
 */
class AlarmScheduler(private val context: Context) {

    private val alarmManager: AlarmManager? = context.getSystemService(AlarmManager::class.java)

    /**
     * Schedules an exact alarm using RTC_WAKEUP.
     * This will wake the device from standby or Doze Mode.
     * 
     * @param alarmTimeMillis Epoch timestamp of the target medicine schedule.
     * @param requestCode Unique code identifier for this specific alert.
     * @param medicineName Name of the medicine to vocalize upon alarm firing.
     */
    fun scheduleExactAlarm(alarmTimeMillis: Long, requestCode: Int, medicineName: String) {
        val manager = alarmManager ?: run {
            Log.e(TAG, "AlarmManager system service is not available.")
            return
        }

        // Enforce Android 12+ (SDK 31+) precise alarm permission check
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !manager.canScheduleExactAlarms()) {
            Toast.makeText(context, "Permission for exact alarms needed. Opening Settings...", Toast.LENGTH_LONG).show()
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            return
        }

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra(MedicationAlertService.EXTRA_MEDICINE_NAME, medicineName)
            putExtra(MedicationAlertService.EXTRA_ALARM_ID, requestCode)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            Log.d(TAG, "Scheduling exact alarm for $medicineName ($requestCode) at $alarmTimeMillis")
            // setExactAndAllowWhileIdle is natively supported on minSdk >= 26 and ensures reliability in deep idle states (Doze mode)
            manager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                alarmTimeMillis,
                pendingIntent
            )
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException: Failed to schedule exact alarm for $medicineName", e)
        }
    }

    /**
     * Cancels an existing medication alarm.
     */
    fun cancelAlarm(requestCode: Int) {
        val intent = Intent(context, AlarmReceiver::class.java)
        PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )?.let { pendingIntent ->
            Log.d(TAG, "Cancelling alarm with ID $requestCode")
            alarmManager?.cancel(pendingIntent)
            pendingIntent.cancel()
        } ?: Log.d(TAG, "No active alarm found with ID $requestCode to cancel")
    }
}

