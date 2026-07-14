package com.example.medivoce

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

private const val TAG_CONSOLE = "MediVoceConsole"
private const val TAG_ERROR = "MediVoceWebViewError"
private const val TAG_NATIVE = "MediVoceNative"

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

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
    class WebAppInterface(context: Context) {
        private val appContext: Context = context.applicationContext
        private var currentRingtone: android.media.Ringtone? = null

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
                Log.e("MediVoceNative", "Error querying device sounds", e)
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
    }
}

