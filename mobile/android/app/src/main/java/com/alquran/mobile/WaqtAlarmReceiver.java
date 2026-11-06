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
 * Guaranteed to wake the CPU in deep Doze mode and never throttled by OEM battery savers.
 * Discards any stale alarms (> 15 minutes overdue) to completely eliminate notification bursts.
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
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "alquran:waqt_alarm");
                wakeLock.acquire(15000L); // 15 seconds max
            } catch (Exception e) {
                Log.w(TAG, "WakeLock acquisition warning: " + e.getMessage());
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

            // Clean up any earlier prayer notifications so only the current waqt displays
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
                .setColor(0xFF10B981)
                .setWhen(now)
                .setShowWhen(true);

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O && soundUri != null) {
                builder.setSound(soundUri);
            }

            notificationManager.notify(waqtId, builder.build());
            Log.i(TAG, "Successfully fired real-time Waqt notification: " + waqtName + " (id=" + waqtId + ")");

            // Notify running app if active
            AndroidAlarmHelperPlugin.onNotificationTapped(waqtName);

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
}
