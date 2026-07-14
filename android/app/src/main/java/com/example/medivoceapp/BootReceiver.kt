package com.example.medivoceapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import org.json.JSONArray
import org.json.JSONException
import java.util.Calendar

private const val TAG = "BootReceiver"

class BootReceiver : BroadcastReceiver() {
    private val bootActions = setOf(
        Intent.ACTION_BOOT_COMPLETED,
        "android.intent.action.QUICKBOOT_POWERON"
    )

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "onReceive: Boot event detected with action=$action")

        if (action in bootActions) {
            Log.i(TAG, "MediVoce: System restarted. Re-scheduling active medication reminders...")
            rescheduleAlarms(context)
        }
    }

    private fun rescheduleAlarms(context: Context) {
        val prefs = context.getSharedPreferences("MediVocePrefs", Context.MODE_PRIVATE)
        val alarmsJson = prefs.getString("active_alarms", null)
        if (alarmsJson.isNullOrEmpty()) {
            Log.i(TAG, "No active alarms found to re-schedule.")
            return
        }

        try {
            val jsonArray = JSONArray(alarmsJson)
            val scheduler = AlarmScheduler(context)
            Log.d(TAG, "Found ${jsonArray.length()} saved alarms to re-schedule.")

            for (i in 0 until jsonArray.length()) {
                val alarmObj = jsonArray.optJSONObject(i) ?: continue
                val id = alarmObj.optInt("nativeId", -1)
                val name = alarmObj.optString("name", "Medicina")
                val timeStr = alarmObj.optString("time", "") // Format "HH:MM"
                val isActive = alarmObj.optBoolean("isActive", false)

                if (id == -1 || timeStr.isEmpty() || !isActive) {
                    continue
                }

                val timeParts = timeStr.split(":")
                if (timeParts.size != 2) continue
                val hours = timeParts[0].toIntOrNull() ?: continue
                val minutes = timeParts[1].toIntOrNull() ?: continue

                val calendar = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, hours)
                    set(Calendar.MINUTE, minutes)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }

                if (calendar.timeInMillis <= System.currentTimeMillis()) {
                    calendar.add(Calendar.DAY_OF_YEAR, 1)
                }

                val timeMillis = calendar.timeInMillis
                scheduler.scheduleExactAlarm(timeMillis, id, name)
                Log.d(TAG, "Re-scheduled alarm: $name (ID: $id) at $timeStr (Target: $timeMillis)")
            }
        } catch (e: JSONException) {
            Log.e(TAG, "Error parsing active alarms JSON", e)
        }
    }
}
