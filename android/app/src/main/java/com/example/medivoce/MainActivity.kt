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

