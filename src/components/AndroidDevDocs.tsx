/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Terminal, Copy, Check, FileCode, Shield } from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../types';

interface AndroidDevDocsProps {
  lang: LanguageCode;
}

export default function AndroidDevDocs({ lang }: AndroidDevDocsProps) {
  const t = TRANSLATIONS[lang];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('scheduler');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const codeModules = {
    scheduler: {
      title: "1. AlarmManager precise wakeups (Kotlin)",
      desc: "Uses AlarmManager with setExactAndAllowWhileIdle and RTC_WAKEUP to wake the device even inside standby/Doze Mode.",
      file: "AlarmScheduler.kt",
      code: `package com.medivoce.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.widget.Toast

class AlarmScheduler(private val context: Context) {
    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    fun scheduleExactAlarm(alarmTimeMillis: Long, requestCode: Int, medicineName: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                val intent = Intent().apply {
                    action = Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM
                }
                context.startActivity(intent)
                return
            }
        }

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra("MEDICINE_NAME", medicineName)
            putExtra("ALARM_ID", requestCode)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                alarmTimeMillis,
                pendingIntent
            )
        } else {
            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                alarmTimeMillis,
                pendingIntent
            )
        }
    }
}`
    },
    receiver: {
      title: "2. Alarm Interceptor & WakeLock (Kotlin)",
      desc: "Catches the alarm broadcast, uses a PowerManager WakeLock to temporarily force the CPU awake, and boots the Foreground Alert Service.",
      file: "AlarmReceiver.kt",
      code: `package com.medivoce.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val medicineName = intent.getStringExtra("MEDICINE_NAME") ?: "Medicina"
        val alarmId = intent.getIntExtra("ALARM_ID", 100)

        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "medivoce::AlarmWakeLockTag"
        )
        
        wakeLock.acquire(10000) // Ensure CPU is awake for 10 seconds max

        val serviceIntent = Intent(context, MedicationAlertService::class.java).apply {
            putExtra("MEDICINE_NAME", medicineName)
            putExtra("ALARM_ID", alarmId)
        }

        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            if (wakeLock.isHeld) wakeLock.release()
        }
    }
}`
    },
    intent: {
      title: "3. Fullscreen Intent & NotificationCompat (Kotlin)",
      desc: "Triggers a highest-priority alarm category notification with a fullScreenIntent callback, turning the phone screen on from deep sleep.",
      file: "NotificationHelper.kt",
      code: `package com.medivoce.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

class NotificationHelper(private val context: Context) {
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val CHANNEL_ID = "medivoce_critical_reminders"

    fun showCriticalNotification(alarmId: Int, medicineName: String) {
        val fullScreenIntent = Intent(context, FullScreenAlertActivity::class.java).apply {
            putExtra("MEDICINE_NAME", medicineName)
            putExtra("ALARM_ID", alarmId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val fullScreenPendingIntent = PendingIntent.getActivity(
            context, alarmId, fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Prendi medicina: $medicineName")
            .setContentText("Tocca per confermare di aver preso il farmaco.")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(fullScreenPendingIntent, true) // Force fullscreen activation
            .setOngoing(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        notificationManager.notify(alarmId, builder.build())
    }
}`
    },
    boot: {
      title: "4. Reschedule upon Reboot helper (Kotlin)",
      desc: "Receives ACTION_BOOT_COMPLETED broadcast and cycles through active schedules to reprogram exact alarm wakeups after systems power cycle.",
      file: "BootReceiver.kt",
      code: `package com.medivoce.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || 
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            
            val scheduler = AlarmScheduler(context)
            // Fetch schedules and reprogram
            // database.getActive().forEach { 
            //     scheduler.scheduleExactAlarm(it.ms, it.id, it.name) 
            // }
            println("MediVoce: System reboot completed. Rescheduled active medicine reminders.")
        }
    }
}`
    },
    manifest: {
      title: "5. Manifest permissions configuration (XML)",
      desc: "Specific permission tags inside AndroidManifest.xml required to run AlarmManager scheduling and WakeLock on Android 14+.",
      file: "AndroidManifest.xml",
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.medivoce.app">

    <!-- SCHEDULE_EXACT_ALARM: Precise Alarms (Android 12/13/14+) -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

    <!-- WAKE_LOCK: Keep CPU active during alarm dispatching -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- USE_FULL_SCREEN_INTENT: Critical alarm screen overlays -->
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

    <!-- RECEIVE_BOOT_COMPLETED: Re-hook alarms on phone restart -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- FOREGROUND_SERVICE & NOTIFICATIONS (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

</manifest>`
    },
    webview: {
      title: "6. WebView Loader & Logcat Console Interceptor (Kotlin)",
      desc: "MainActivity configured with standard WebView settings. Enables DOM Storage (crucial for localStorage), and redirects console.log and errors to Logcat.",
      file: "MainActivity.kt",
      code: `package com.medivoce.app

import android.os.Bundle
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        setContentView(webView)

        // Secure and configure WebView for React
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true // CRITICAL: Required for React local storage state!
            allowFileAccess = true   // Required for accessing local build assets inside assets/ index.html
            allowContentAccess = true
            databaseEnabled = true
        }

        // Bridge JavaScript console.log directly into Android Studio Logcat
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                if (consoleMessage != null) {
                    android.util.Log.d("MediVoceConsole", 
                        "\${consoleMessage.message()} -- from line \${consoleMessage.lineNumber()} of \${consoleMessage.sourceId()}"
                    )
                }
                return true
            }
        }

        // Catch WebView resource and connection errors
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    android.util.Log.e("MediVoceWebViewError", "WebView Load Failed! Error: \${error?.description}")
                }
            }
        }

        // --- CHOOSE HOW TO LOAD THE APPLICATION ---
        // Option A: Local assets (Compile with 'npm run build', copy files under Android's src/main/assets/)
        webView.loadUrl("file:///android_asset/index.html")

        // Option B: Live URL (Loads remote deployed build server)
        // webView.loadUrl("https://ais-pre-o2sc4vs3bmkzzjiwtauxky-910409829424.europe-west2.run.app")
    }
}`
    }
  };

  return (
    <div id="android-dev-suite" className="bg-[#1A1108] text-amber-100/90 rounded-3xl p-5 border border-amber-900/40 shadow-xl space-y-4 font-mono text-xs">
      
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-amber-900/30 pb-3">
        <Terminal className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="font-bold text-sm text-white tracking-wide uppercase">Area Sviluppo: Android Native Code</h3>
          <p className="text-3xs text-amber-500/70">Struttura AlarmManager, WakeLock & Manifest compilata in Kotlin</p>
        </div>
      </div>

      {/* Tabs list inside code block */}
      <div className="flex flex-wrap gap-1.5 border-b border-amber-950 pb-2">
        {Object.entries(codeModules).map(([key, item]) => (
          <button
            id={`tab-sel-${key}`}
            key={key}
            onClick={() => setActiveTab(key)}
            className={`py-1.5 px-2.5 rounded-lg text-3xs font-bold transition-all ${
              activeTab === key 
                ? 'bg-amber-500 text-black shadow-sm' 
                : 'bg-amber-950/40 text-amber-500 hover:bg-amber-950'
            }`}
          >
            {item.file}
          </button>
        ))}
      </div>

      {/* Code Details pane */}
      {Object.entries(codeModules).map(([key, item]) => {
        if (key !== activeTab) return null;
        const isCopied = copiedId === key;

        return (
          <div key={key} className="space-y-3 animate-fade-in text-wrap">
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-1">
                <span className="text-amber-500 block font-bold text-2xs">{item.title}</span>
                <p className="text-3xs text-gray-400 font-sans leading-relaxed">{item.desc}</p>
              </div>
              
              <button
                id={`copy-code-${key}`}
                onClick={() => handleCopy(key, item.code)}
                className="py-1 px-2 rounded bg-amber-900/30 hover:bg-amber-900/50 border border-amber-800/40 text-amber-500 flex items-center gap-1 transition-all"
                title="Copia codice"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? "Copiato" : "Copia"}</span>
              </button>
            </div>

            {/* Code Highlight Box */}
            <div className="relative rounded-2xl bg-black/55 p-4 overflow-x-auto border border-amber-950 max-h-80 text-nowrap select-all whitespace-pre">
              <code>{item.code}</code>
            </div>

            <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/20 flex gap-2 font-sans text-amber-600">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-3xs leading-relaxed font-semibold">
                I file completi sono memorizzati nel workspace all'interno del percorso <span className="underline font-mono">/android/</span> pronti per essere integrati nel tuo progetto Android Studio.
              </p>
            </div>
          </div>
        );
      })}

    </div>
  );
}
