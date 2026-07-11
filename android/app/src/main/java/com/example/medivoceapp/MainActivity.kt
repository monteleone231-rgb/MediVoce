package com.example.medivoceapp

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    private val TAG_NATIVE = "MediVoceNative"
    private lateinit var scheduler: AlarmScheduler

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        scheduler = AlarmScheduler(this)

        bridge?.webView?.let { webView ->
            webView.addJavascriptInterface(AndroidInterface(this, scheduler), "Android")
            Log.d(TAG_NATIVE, "Custom JavaScript Interface 'Android' successfully registered.")
        }
    }

    class AndroidInterface(
        private val context: Context,
        private val scheduler: AlarmScheduler
    ) {
        @JavascriptInterface
        fun scheduleAlarm(timeMillis: Long, id: Int, name: String) {
            scheduler.scheduleExactAlarm(timeMillis, id, name)
            Log.d("MediVoceNative", "Scheduled alarm: $name (ID: $id) at $timeMillis")
        }

        @JavascriptInterface
        fun cancelAlarm(id: Int) {
            scheduler.cancelAlarm(id)
            Log.d("MediVoceNative", "Cancelled alarm ID: $id")
        }

        @JavascriptInterface
        fun saveAlarmsToNative(alarmsJson: String) {
            val prefs = context.getSharedPreferences("MediVocePrefs", Context.MODE_PRIVATE)
            prefs.edit().putString("active_alarms", alarmsJson).apply()
            Log.d("MediVoceNative", "Saved alarms to native storage: $alarmsJson")
        }
    }
}
