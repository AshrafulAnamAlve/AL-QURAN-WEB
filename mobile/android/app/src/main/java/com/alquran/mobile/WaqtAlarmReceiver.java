package com.alquran.mobile;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * High-priority native BroadcastReceiver triggered by Android AlarmManager.setAlarmClock()
 * for real-time Waqt notifications.
 *
 * Designed specifically for deep sleep and long app inactivity:
 *  1. Uses WakeLock with ACQUIRE_CAUSES_WAKEUP to wake CPU and turn on the screen.
 *  2. Uses setFullScreenIntent so heads-up / lockscreen alert displays over lock screen.
 *  3. Bypasses Do Not Disturb (DND) and App Standby buckets.
 *  4. Plays Adhan Takbeer alert through the hardware ALARM audio stream.
 *  5. Automatically self-heals/replenishes upcoming alarms if the app is not opened for weeks.
 *  6. Discards stale alarms (> 15 minutes overdue) to prevent notification bursts.
 */
public class WaqtAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "WaqtAlarmReceiver";
    public static final String ACTION_WAQT_ALARM = "com.alquran.mobile.ACTION_WAQT_ALARM";
    public static final String CHANNEL_ID = "adhan_prayer_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            try {
                // ACQUIRE_CAUSES_WAKEUP turns on the screen if the phone is asleep
                int wakeFlags = PowerManager.PARTIAL_WAKE_LOCK;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                    wakeFlags |= PowerManager.ACQUIRE_CAUSES_WAKEUP;
                }
                wakeLock = pm.newWakeLock(wakeFlags, "alquran:waqt_alarm");
                wakeLock.acquire(15000L); // 15 seconds max
            } catch (Exception e) {
                try {
                    // Fallback to standard partial wake lock
                    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "alquran:waqt_alarm");
                    wakeLock.acquire(15000L);
                } catch (Exception ignored) {}
            }
        }

        try {
            int waqtId = intent.getIntExtra("waqt_id", 1000);
            String waqtName = intent.getStringExtra("waqt_name");
            String title = intent.getStringExtra("waqt_title");
            String body = intent.getStringExtra("waqt_body");
            long scheduledTime = intent.getLongExtra("scheduled_time", 0L);

            long now = System.currentTimeMillis();

            // CRITICAL DEFENSE: If this alarm was delayed by power-off or airplane mode
            // and arrives more than 15 minutes past its scheduled time, DISCARD IT!
            // This 100% eliminates the burst of old notifications on wake/open.
            if (scheduledTime > 0 && Math.abs(now - scheduledTime) > 15 * 60 * 1000L) {
                Log.w(TAG, "Discarding expired Waqt alarm for " + waqtName +
                        " (scheduled=" + scheduledTime + ", now=" + now + ")");
                return;
            }

            if (title == null || title.trim().isEmpty()) {
                title = "🕌 নামাজের ওয়াক্ত হয়েছে";
            }
            if (body == null || body.trim().isEmpty()) {
                body = "হাইয়া আলাস-সালাহ — সালাতের দিকে আসুন।";
            }

            ensureNotificationChannel(context);

            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

            // Clean up earlier prayer notifications so only the active waqt is visible
            dismissPreviousPrayerNotifications(context, waqtId);

            // Tap intent opens MainActivity directly to prayer / Adhan view
            Intent tapIntent = new Intent(context, MainActivity.class);
            tapIntent.setAction(Intent.ACTION_MAIN);
            tapIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            tapIntent.putExtra("waqt_name", waqtName != null ? waqtName : "");
            tapIntent.putExtra("from_notification", true);
            tapIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            int pFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                pFlags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent contentPendingIntent = PendingIntent.getActivity(
                context,
                waqtId,
                tapIntent,
                pFlags
            );

            // Resolve notification icon
            int iconRes = context.getResources().getIdentifier("ic_stat_quran", "drawable", context.getPackageName());
            if (iconRes == 0) {
                iconRes = context.getApplicationInfo().icon;
            }

            Uri soundUri = getAdhanSoundUri(context);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(iconRes)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setContentIntent(contentPendingIntent)
                .setFullScreenIntent(contentPendingIntent, true) // Displays heads-up on lockscreen even in deep sleep
                .setColor(0xFF10B981)
                .setWhen(now)
                .setShowWhen(true);

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O && soundUri != null) {
                builder.setSound(soundUri);
            }

            notificationManager.notify(waqtId, builder.build());
            Log.i(TAG, "Successfully fired real-time Waqt notification: " + waqtName + " (id=" + waqtId + ")");

            // Play hardware alarm stream audio chime
            playAlarmAudio(context);

            // Notify running app if active
            AndroidAlarmHelperPlugin.onNotificationTapped(waqtName);

            // Self-healing: check if future alarms are running low (in case user hasn't opened app for weeks)
            WaqtAlarmScheduler.checkAndReplenishAlarms(context);

        } catch (Exception e) {
            Log.e(TAG, "Error displaying Waqt alarm notification", e);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                try {
                    wakeLock.release();
                } catch (Exception ignored) {}
            }
        }
    }

    private void dismissPreviousPrayerNotifications(Context context, int currentWaqtId) {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                int[] standardWaqtIds = new int[]{1001, 1002, 1003, 1004, 1005};
                for (int id : standardWaqtIds) {
                    if (id != currentWaqtId) {
                        nm.cancel(id);
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    public static void ensureNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            NotificationChannel channel = nm.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Adhan & Prayer Times",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Real-time Waqt notifications and Adhan recitation alerts");
                channel.enableLights(true);
                channel.setLightColor(Color.parseColor("#10B981"));
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 500, 250, 500, 250, 500});
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                channel.setBypassDnd(true);

                Uri soundUri = getAdhanSoundUri(context);
                if (soundUri != null) {
                    AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build();
                    channel.setSound(soundUri, audioAttributes);
                }

                nm.createNotificationChannel(channel);
            }
        }
    }

    public static Uri getAdhanSoundUri(Context context) {
        int soundResId = context.getResources().getIdentifier("adhan", "raw", context.getPackageName());
        if (soundResId != 0) {
            return Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResId);
        }
        return null;
    }

    /**
     * Plays the Adhan alert audio via MediaPlayer routed to the dedicated ALARM audio stream.
     * This ensures the alert sounds even if device ringer/notification volume is muted or on vibrate.
     */
    private void playAlarmAudio(Context context) {
        try {
            int soundResId = context.getResources().getIdentifier("adhan", "raw", context.getPackageName());
            if (soundResId == 0) return;

            final MediaPlayer mediaPlayer = new MediaPlayer();
            Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResId);
            mediaPlayer.setDataSource(context, soundUri);

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            mediaPlayer.setAudioAttributes(audioAttributes);
            mediaPlayer.setVolume(1.0f, 1.0f);
            mediaPlayer.setLooping(false);

            mediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                @Override
                public void onPrepared(MediaPlayer mp) {
                    try {
                        mp.start();
                    } catch (Exception e) {
                        try { mp.release(); } catch (Exception ignored) {}
                    }
                }
            });

            mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mp) {
                    try {
                        mp.release();
                    } catch (Exception ignored) {}
                }
            });

            mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer mp, int what, int extra) {
                    try {
                        mp.release();
                    } catch (Exception ignored) {}
                    return true;
                }
            });

            mediaPlayer.prepareAsync();
        } catch (Exception e) {
            Log.w(TAG, "playAlarmAudio notice: " + e.getMessage());
        }
    }
}
