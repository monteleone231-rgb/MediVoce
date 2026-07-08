package com.example.medivoce

import android.content.Context
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
            }

            // Expose JavaScript Interface using applicationContext to prevent activity memory leaks
            addJavascriptInterface(WebAppInterface(context), "Android")

            // Load the React Web App
            // We load the Development App URL for seamless live preview and native synchronization
            loadUrl("https://ais-dev-o2sc4vs3bmkzzjiwtauxky-910409829424.europe-west2.run.app")
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
    }
}

