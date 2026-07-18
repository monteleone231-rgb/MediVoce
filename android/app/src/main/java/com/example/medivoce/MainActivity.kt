package com.example.medivoce

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import android.speech.tts.TextToSpeech
import java.util.Locale

private const val TAG_CONSOLE = "MediVoceConsole"
private const val TAG_ERROR = "MediVoceWebViewError"
private const val TAG_NATIVE = "MediVoceNative"

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {
    private lateinit var webView: WebView
    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false
    @Volatile
    var cachedSoundsJson: String = "[]"

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            Log.d(TAG_NATIVE, "TextToSpeech successfully initialized.")
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
            
            val pitch = if (tone == "empathetic") 1.2f else 1.0f
            tts?.setPitch(pitch)

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
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

    private fun isTrustedUrl(url: String): Boolean {
        val uri = Uri.parse(url)
        val host = uri.host ?: return false
        // Allow local development, loopbacks, and Google Cloud Run dev/pre URLs
        return host == "localhost" || 
               host == "127.0.0.1" || 
               host.endsWith(".run.app")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            tts = TextToSpeech(this, this)
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error creating TextToSpeech", e)
        }

        // Preload device ringtones and notification sounds in a background thread to prevent UI freezing
        Thread {
            val ringtonesList = org.json.JSONArray()
            try {
                val rm = android.media.RingtoneManager(this)
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
                cachedSoundsJson = ringtonesList.toString()
                Log.d(TAG_NATIVE, "Preloaded ${ringtonesList.length()} device sounds in background.")
            } catch (e: Exception) {
                Log.e(TAG_NATIVE, "Error preloading device sounds in background", e)
            }
        }.start()
        
        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true // Required for React localStorage
                allowFileAccess = true   // Required for accessing local assets
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
            }

            // Bridge JavaScript console.log directly into Android Logcat
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    consoleMessage?.let {
                        Log.d(TAG_CONSOLE, "${it.message()} -- from line ${it.lineNumber()} of ${it.sourceId()}")
                    }
                    return true
                }

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
                    super.onPermissionRequest(request)
                }
            }

            // Catch WebView resource and connection errors
            webViewClient = object : WebViewClient() {
                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    Log.e(TAG_ERROR, "WebView Load Failed! Error: ${error?.description}")
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    
                    // Let the WebView load local assets internally
                    if (url.startsWith("file:///android_asset/")) {
                        return false
                    }

                    // Handle telephone links (e.g. clicking "Chiama Ora" emergency button in React UI)
                    if (url.startsWith("tel:")) {
                        try {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url)).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            this@MainActivity.startActivity(intent)
                        } catch (e: Exception) {
                            Log.e(TAG_NATIVE, "Failed to launch native dialer for URI: $url", e)
                        }
                        return true
                    }

                    // Security: Sandbox external web pages. If the user clicks an external link (like BuyMeACoffee),
                    // open it in the default system browser instead of the WebView to prevent foreign JS from executing native bridge calls.
                    if (!isTrustedUrl(url)) {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            this@MainActivity.startActivity(intent)
                        } catch (e: Exception) {
                            Log.e(TAG_NATIVE, "Failed to launch external browser for URI: $url", e)
                        }
                        return true
                    }

                    return false
                }
            }

            // Expose JavaScript Interface using applicationContext to prevent activity memory leaks
            addJavascriptInterface(WebAppInterface(context), "Android")

            // Load the React Web App
            // Load from embedded local assets for full offline operation
            loadUrl("file:///android_asset/index.html")
        }

        setContentView(webView)

        // Modern OnBackPressedCallback replacing deprecated onBackPressed()
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    // Regular class for JS Interface to communicate back and forth (prevents activity memory leaks by saving applicationContext)
    class WebAppInterface(private val activityContext: Context) {
        private val appContext: Context = activityContext.applicationContext
        private var currentRingtone: android.media.Ringtone? = null

        @JavascriptInterface
        fun speak(text: String, lang: String, rate: Double, tone: String) {
            (activityContext as? MainActivity)?.runOnUiThread {
                (activityContext as? MainActivity)?.speak(text, lang, rate.toFloat(), tone)
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            (activityContext as? MainActivity)?.runOnUiThread {
                (activityContext as? MainActivity)?.stopSpeaking()
            }
        }

        @JavascriptInterface
        fun vibrate(durationMillis: Long) {
            try {
                val vibrator = appContext.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
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
            val cached = (activityContext as? MainActivity)?.cachedSoundsJson
            if (cached != null && cached != "[]") {
                Log.d("MediVoceNative", "Returning cached device sounds instantly.")
                return cached
            }
            // Fallback (should rarely occur, but is safe in case cache isn't fully loaded yet)
            val ringtonesList = org.json.JSONArray()
            try {
                val rm = android.media.RingtoneManager(appContext)
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
                Log.e("MediVoceNative", "Error querying device sounds in fallback", e)
            }
            return ringtonesList.toString()
        }

        @JavascriptInterface
        fun playDeviceSound(uriString: String) {
            try {
                stopDeviceSound()
                val uri = android.net.Uri.parse(uriString)
                currentRingtone = android.media.RingtoneManager.getRingtone(appContext, uri)
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
        fun showToast(message: String) {
            Toast.makeText(appContext, message, Toast.LENGTH_SHORT).show()
        }

        @JavascriptInterface
        fun scheduleAlarm(timeMillis: Long, id: Int, name: String) {
            val scheduler = AlarmScheduler(appContext)
            scheduler.scheduleExactAlarm(timeMillis, id, name)
            Log.d(TAG_NATIVE, "Scheduled alarm $id for $name at $timeMillis")
        }

        @JavascriptInterface
        fun cancelAlarm(id: Int) {
            val scheduler = AlarmScheduler(appContext)
            scheduler.cancelAlarm(id)
            Log.d(TAG_NATIVE, "Cancelled alarm $id")
        }

        @JavascriptInterface
        fun saveAlarmsToNative(alarmsJson: String) {
            val prefs = appContext.getSharedPreferences("MediVocePrefs", Context.MODE_PRIVATE)
            prefs.edit().putString("active_alarms", alarmsJson).apply()
            Log.d(TAG_NATIVE, "Saved alarms to native storage: $alarmsJson")
        }

        @JavascriptInterface
        fun savePreferencesToNative(lang: String, voiceEnabled: Boolean, speed: Double, tone: String) {
            val prefs = appContext.getSharedPreferences("MediVocePrefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putString("lang", lang)
                .putBoolean("voiceEnabled", voiceEnabled)
                .putFloat("speed", speed.toFloat())
                .putString("tone", tone)
                .apply()
            Log.d(TAG_NATIVE, "Saved preferences to native storage: lang=$lang, voiceEnabled=$voiceEnabled, speed=$speed, tone=$tone")
        }

        @JavascriptInterface
        fun openAppSettings() {
            try {
                val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                intent.data = Uri.parse("package:" + appContext.packageName)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                appContext.startActivity(intent)
                Log.d("MediVoceNative", "Opened app settings.")
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error opening app settings", e)
            }
        }

        @JavascriptInterface
        fun openNotificationSettings() {
            try {
                val intent = Intent()
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    intent.action = android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS
                    intent.putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, appContext.packageName)
                } else {
                    intent.action = "android.settings.APP_NOTIFICATION_SETTINGS"
                    intent.putExtra("app_package", appContext.packageName)
                    intent.putExtra("app_uid", appContext.applicationInfo.uid)
                }
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                appContext.startActivity(intent)
                Log.d("MediVoceNative", "Opened notification settings.")
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error opening notification settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openExactAlarmSettings() {
            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    val intent = Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                    intent.data = Uri.parse("package:" + appContext.packageName)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    appContext.startActivity(intent)
                    Log.d("MediVoceNative", "Opened exact alarm settings.")
                } else {
                    openAppSettings()
                }
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error opening exact alarm settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openBatteryOptimizationSettings() {
            try {
                val intent = Intent()
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    intent.action = android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                } else {
                    intent.action = android.provider.Settings.ACTION_SETTINGS
                }
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                appContext.startActivity(intent)
                Log.d("MediVoceNative", "Opened battery optimization settings.")
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error opening battery settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openOverlaySettings() {
            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    val intent = Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
                    intent.data = Uri.parse("package:" + appContext.packageName)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    appContext.startActivity(intent)
                    Log.d("MediVoceNative", "Opened overlay settings.")
                } else {
                    openAppSettings()
                }
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error opening overlay settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openFullScreenIntentSettings() {
            try {
                if (android.os.Build.VERSION.SDK_INT >= 34) { // Android 14+
                    val intent = Intent("android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT")
                    intent.data = Uri.parse("package:" + appContext.packageName)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    appContext.startActivity(intent)
                    Log.d("MediVoceNative", "Opened full screen intent settings (Android 14+).")
                } else {
                    openNotificationSettings()
                }
            } catch (e: Exception) {
                Log.e("MediVoceNative", "Error opening full screen intent settings", e)
                openNotificationSettings()
            }
        }
    }
}

