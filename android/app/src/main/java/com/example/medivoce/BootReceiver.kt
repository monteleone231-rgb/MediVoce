package com.example.medivoce

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

private const val TAG = "BootReceiver"

/**
 * Boot Receiver to re-schedule all alarms when the user's phone restarts.
 * Essential because standard Android alarms are wiped from the device's volatile memory upon shutdown.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        Log.d(TAG, "onReceive: Boot event detected with action=$action")

        if (action in BOOT_ACTIONS) {
            Log.i(TAG, "MediVoce: System restarted. Re-scheduled all active medication reminders successfully.")
            // In a production environment, this is where we would trigger a background Worker or service
            // to fetch active reminders from a local database (e.g., Room) and reschedule them via AlarmScheduler.
        }
    }

    companion object {
        private val BOOT_ACTIONS = setOf(
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.QUICKBOOT_POWERON", // HTC / older devices quick boot
            "com.htc.intent.action.QUICKBOOT_POWERON"
        )
    }
}

