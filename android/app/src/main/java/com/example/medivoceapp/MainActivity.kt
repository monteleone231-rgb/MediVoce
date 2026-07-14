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
        private var currentRingtone: android.media.Ringtone? = null

        @JavascriptInterface
        fun vibrate(durationMillis: Long) {
            try {
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createOneShot(durationMillis, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(durationMillis)
                }
                Log.d("MediVoceNative", "Vibrated native device for $durationMillis ms")
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error in native vibration", e)
            }
        }

        @JavascriptInterface
        fun getDeviceSounds(): String {
            val ringtonesList = org.json.JSONArray()
            try {
                val rm = android.media.RingtoneManager(context)
                rm.setType(android.media.RingtoneManager.TYPE_NOTIFICATION or android.media.RingtoneManager.TYPE_RINGTONE)
                val cursor = rm.cursor
                while (cursor.moveToNext()) {
                    val title = cursor.getString(android.media.RingtoneManager.TITLE_COLUMN_INDEX)
                    val uri = rm.getRingtoneUri(cursor.position)
                    if (uri != null) {
                        val obj = org.json.JSONObject()
                        obj.put("title", title)
                        obj.put("uri", uri.toString())
                        ringtonesList.put(obj)
                    }
                }
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error querying device sounds", e)
            }
            return ringtonesList.toString()
        }

        @JavascriptInterface
        fun playDeviceSound(uriString: String) {
            try {
                stopDeviceSound()
                val uri = android.net.Uri.parse(uriString)
                currentRingtone = android.media.RingtoneManager.getRingtone(context, uri)
                currentRingtone?.play()
                Log.d("MediVoceNative", "Playing device sound: $uriString")
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error playing device sound", e)
            }
        }

        @JavascriptInterface
        fun stopDeviceSound() {
            try {
                currentRingtone?.let {
                    if (it.isPlaying) {
                        it.stop()
                    }
                }
                currentRingtone = null
                Log.d("MediVoceNative", "Stopped device sound playback")
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error stopping device sound", e)
            }
        }

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
