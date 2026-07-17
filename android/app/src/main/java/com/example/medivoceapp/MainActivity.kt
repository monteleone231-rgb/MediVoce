package com.example.medivoceapp

import android.content.Context
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.ValueCallback
import android.net.Uri
import androidx.core.content.edit
import androidx.core.net.toUri
import com.getcapacitor.BridgeActivity
import org.json.JSONArray
import org.json.JSONObject
import android.speech.tts.TextToSpeech
import java.util.Locale

class MainActivity : BridgeActivity(), TextToSpeech.OnInitListener {
    private val TAG_NATIVE = "MediVoceNative"
    private lateinit var scheduler: AlarmScheduler
    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false
    @Volatile
    var cachedSoundsJson: String = "[]"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        scheduler = AlarmScheduler(this)
        
        try {
            tts = TextToSpeech(this, this)
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error creating TextToSpeech", e)
        }

        // Preload device ringtones and notification sounds in a background thread to prevent UI freezing
        Thread {
            val ringtonesList = JSONArray()
            try {
                val rm = RingtoneManager(this)
                rm.setType(RingtoneManager.TYPE_NOTIFICATION or RingtoneManager.TYPE_RINGTONE)
                val cursor = rm.cursor
                while (cursor.moveToNext()) {
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                    val uri = rm.getRingtoneUri(cursor.position)
                    if (uri != null) {
                        val obj = JSONObject()
                        obj.put("title", title)
                        obj.put("uri", uri.toString())
                        ringtonesList.put(obj)
                    }
                }
                cachedSoundsJson = ringtonesList.toString()
                Log.d(TAG_NATIVE, "Preloaded ${ringtonesList.length()} device sounds in background.")
            } catch (e: Exception) {
                Log.e(TAG_NATIVE, "Error preloading device sounds in background", e)
            }
        }.start()

        bridge?.webView?.let { webView ->
            webView.addJavascriptInterface(AndroidInterface(this, this, scheduler), "Android")
            Log.d(TAG_NATIVE, "Custom JavaScript Interface 'Android' successfully registered.")

            // Set custom WebChromeClient wrapper to safely grant web microphone permissions while delegating to Capacitor's original chrome client
            val originalChromeClient = webView.webChromeClient
            webView.webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    if (request != null) {
                        val resources = request.resources
                        for (res in resources) {
                            if (res == PermissionRequest.RESOURCE_AUDIO_CAPTURE) {
                                request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
                                Log.d(TAG_NATIVE, "Granted webview microphone permission to the web application.")
                                return
                            }
                        }
                    }
                    if (originalChromeClient != null) {
                        originalChromeClient.onPermissionRequest(request)
                    } else {
                        super.onPermissionRequest(request)
                    }
                }

                override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                    return originalChromeClient?.onConsoleMessage(consoleMessage) ?: super.onConsoleMessage(consoleMessage)
                }

                override fun onShowFileChooser(
                    webView: android.webkit.WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    return originalChromeClient?.onShowFileChooser(webView, filePathCallback, fileChooserParams) ?: super.onShowFileChooser(webView, filePathCallback, fileChooserParams)
                }
            }
        }

        // Request runtime microphone permission on startup if not already granted (Android M/6.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(arrayOf(android.Manifest.permission.RECORD_AUDIO), 101)
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            Log.d(TAG_NATIVE, "TextToSpeech successfully initialized.")
            // Set default language to Italian
            tts?.language = Locale.ITALIAN
        } else {
            Log.e(TAG_NATIVE, "Failed to initialize TextToSpeech (status: $status)")
        }
    }

    fun speak(text: String, lang: String, rate: Float, tone: String) {
        if (!isTtsInitialized || tts == null) {
            Log.e(TAG_NATIVE, "speak: TTS not initialized or is null")
            return
        }
        try {
            val locale = if (lang.lowercase().startsWith("it")) Locale.ITALIAN else Locale.ENGLISH
            tts?.language = locale
            tts?.setSpeechRate(rate)
            
            // Warm pitch vs clear firm pitch
            val pitch = if (tone == "empathetic") 1.2f else 1.0f
            tts?.setPitch(pitch)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "medivoce_speech")
            } else {
                @Suppress("DEPRECATION")
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null)
            }
            Log.d(TAG_NATIVE, "Native TTS speaking: $text")
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error during speak", e)
        }
    }

    fun stopSpeaking() {
        try {
            tts?.stop()
            Log.d(TAG_NATIVE, "Stopped native speaking")
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error stopping native TTS", e)
        }
    }

    override fun onDestroy() {
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error on destroying TextToSpeech", e)
        }
        super.onDestroy()
    }

    class AndroidInterface(
        private val activity: android.app.Activity,
        private val context: Context,
        private val scheduler: AlarmScheduler
    ) {
        private var currentRingtone: Ringtone? = null

        @JavascriptInterface
        fun vibrate(durationMillis: Double) {
            vibrate(durationMillis.toLong())
        }

        @JavascriptInterface
        fun vibrate(durationMillis: Long) {
            try {
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (!vibrator.hasVibrator()) {
                    Log.w("MediVoceNative", "vibrate: Device does not have a vibrator motor")
                    return
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(durationMillis, VibrationEffect.DEFAULT_AMPLITUDE))
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
            val cached = (activity as? MainActivity)?.cachedSoundsJson
            if (cached != null && cached != "[]") {
                Log.d("MediVoceNative", "Returning cached device sounds instantly.")
                return cached
            }
            // Fallback (should rarely occur, but is safe in case cache isn't fully loaded yet)
            val ringtonesList = JSONArray()
            try {
                val rm = RingtoneManager(context)
                rm.setType(RingtoneManager.TYPE_NOTIFICATION or RingtoneManager.TYPE_RINGTONE)
                val cursor = rm.cursor
                while (cursor.moveToNext()) {
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                    val uri = rm.getRingtoneUri(cursor.position)
                    if (uri != null) {
                        val obj = JSONObject()
                        obj.put("title", title)
                        obj.put("uri", uri.toString())
                        ringtonesList.put(obj)
                    }
                }
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error querying device sounds in fallback", e)
            }
            return ringtonesList.toString()
        }

        @JavascriptInterface
        fun playDeviceSound(uriString: String) {
            try {
                stopDeviceSound()
                val uri = uriString.toUri()
                currentRingtone = RingtoneManager.getRingtone(context, uri)
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
            prefs.edit {
                putString("active_alarms", alarmsJson)
            }
            Log.d("MediVoceNative", "Saved alarms to native storage: $alarmsJson")
        }

        @JavascriptInterface
        fun savePreferencesToNative(lang: String, voiceEnabled: Boolean, speed: Double, tone: String) {
            val prefs = context.getSharedPreferences("MediVocePrefs", Context.MODE_PRIVATE)
            prefs.edit {
                putString("lang", lang)
                putBoolean("voiceEnabled", voiceEnabled)
                putFloat("speed", speed.toFloat())
                putString("tone", tone)
            }
            Log.d("MediVoceNative", "Saved preferences to native storage: lang=$lang, voiceEnabled=$voiceEnabled, speed=$speed, tone=$tone")
        }

        @JavascriptInterface
        fun hasRecordAudioPermission(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                context.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
        }

        @JavascriptInterface
        fun requestRecordAudioPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                activity.runOnUiThread {
                    activity.requestPermissions(arrayOf(android.Manifest.permission.RECORD_AUDIO), 101)
                }
            }
        }

        @JavascriptInterface
        fun speak(text: String, lang: String, rate: Double, tone: String) {
            activity.runOnUiThread {
                (activity as? MainActivity)?.speak(text, lang, rate.toFloat(), tone)
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            activity.runOnUiThread {
                (activity as? MainActivity)?.stopSpeaking()
            }
        }
    }
}
