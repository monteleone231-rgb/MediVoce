package com.example.medivoce

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

private const val TAG = "FullScreenAlertActivity"
private val BACKGROUND_COLOR = Color(0xFF0F172A)
private val CARD_BACKGROUND_COLOR = Color(0xFF1E293B)
private val BUTTON_SNOOZE_COLOR = Color(0xFF334155)
private val BUTTON_CONFIRM_COLOR = Color(0xFF10B981)
private val ALERT_CRITICAL_COLOR = Color(0xFFEF4444)

class FullScreenAlertActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var medicineName: String = ""
    private var alarmId: Int = 0
    private var isTtsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Wake screen, unlock keyguard and show layout over lockscreen
        dismissKeyguardAndTurnScreenOn()

        medicineName = intent.getStringExtra(MedicationAlertService.EXTRA_MEDICINE_NAME) ?: "Medicina"
        alarmId = intent.getIntExtra(MedicationAlertService.EXTRA_ALARM_ID, 0)

        // Initialize Text-To-Speech safely using applicationContext to prevent activity memory leaks
        tts = TextToSpeech(applicationContext, this)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BACKGROUND_COLOR
                ) {
                    AlertContent(
                        medicineName = medicineName,
                        onConfirm = ::confirmTaken,
                        onSnooze = ::snoozeReminder
                    )
                }
            }
        }
    }

    private fun confirmTaken() {
        // Stop foreground alert loop
        stopService(Intent(this, MedicationAlertService::class.java))
        Log.d(TAG, "Medicine $medicineName ($alarmId) marked as taken.")
        finish()
    }

    private fun snoozeReminder() {
        // Stop current alarm sound loop
        stopService(Intent(this, MedicationAlertService::class.java))

        // Post snooze timer in 10 minutes (600,000 milliseconds)
        val snoozeTime = System.currentTimeMillis() + 10 * 60 * 1000
        val scheduler = AlarmScheduler(this)
        scheduler.scheduleExactAlarm(snoozeTime, alarmId, medicineName)

        Log.d(TAG, "Medicine $medicineName ($alarmId) SNOOZED for 10 min.")
        finish()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.ITALIAN)
            if (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED) {
                isTtsReady = true
                speakReminder()
            } else {
                Log.w(TAG, "Language data missing or not supported.")
            }
        } else {
            Log.e(TAG, "TTS Initialization failed with status: $status")
        }
    }

    private fun speakReminder() {
        if (isTtsReady) {
            val sentence = "Attenzione. È il momento di assumere il farmaco: $medicineName. Ripeto: $medicineName."
            tts?.speak(sentence, TextToSpeech.QUEUE_FLUSH, null, "medicine_alert_tts")
        }
    }

    override fun onDestroy() {
        tts?.apply {
            stop()
            shutdown()
        }
        tts = null
        super.onDestroy()
    }
}

@Composable
fun AlertContent(
    medicineName: String,
    onConfirm: () -> Unit,
    onSnooze: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Section
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 48.dp)
        ) {
            Text(
                text = "PROMEMORIA CRITICO",
                color = ALERT_CRITICAL_COLOR,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Ora di assumere la tua medicina",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )
        }

        // Central Area
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(160.dp)
                    .background(CARD_BACKGROUND_COLOR, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "💊",
                    fontSize = 72.sp
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = medicineName,
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Importante per il tuo piano terapeutico",
                color = Color.Gray,
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )
        }

        // Bottom Actions Section
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Snooze / Rimanda button
            Button(
                onClick = onSnooze,
                colors = ButtonDefaults.buttonColors(containerColor = BUTTON_SNOOZE_COLOR),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp)
            ) {
                Text(
                    text = "Rimanda",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            // Taken / Conferma button
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = BUTTON_CONFIRM_COLOR),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .weight(1.2f)
                    .height(56.dp)
            ) {
                Text(
                    text = "Presa ✓",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }
}

// Extension to dismiss keyguard and wake screen cleanly
private fun ComponentActivity.dismissKeyguardAndTurnScreenOn() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        getSystemService(KeyguardManager::class.java)?.requestDismissKeyguard(this, null)
    } else {
        @Suppress("DEPRECATION")
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
    }
}
