package com.example.medivoce

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log

private const val TAG = "MedicationAlertService"

class MedicationAlertService : Service() {

    private lateinit var notificationHelper: NotificationHelper

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "onCreate: Initializing MedicationAlertService")
        notificationHelper = NotificationHelper(applicationContext)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val medicineName = intent?.getStringExtra(EXTRA_MEDICINE_NAME) ?: DEFAULT_MEDICINE_NAME
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

    override fun onDestroy() {
        Log.d(TAG, "onDestroy: Shutting down alert service and cleaning up MediaPlayer resources")
        // Stop any playing sound loop when service is dismissed
        notificationHelper.stopAlarmSound()
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

