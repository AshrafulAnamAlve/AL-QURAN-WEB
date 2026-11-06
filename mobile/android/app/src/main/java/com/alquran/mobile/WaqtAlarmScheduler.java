package com.alquran.mobile;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/**
 * Native Waqt Alarm Scheduler using Android AlarmManager.setAlarmClock().
 *
 * Unlike setExactAndAllowWhileIdle, setAlarmClock() is treated by Android OS and OEM
 * task managers as an authentic clock alarm:
 *  1. Completely exempt from Doze mode maintenance windows and App Standby buckets.
 *  2. Wakes the CPU at the exact second even when the phone has been idle for days.
 *  3. Persists alarms to SharedPreferences so WaqtBootReceiver restores them on reboot.
 */
public class WaqtAlarmScheduler {
    private static final String TAG = "WaqtAlarmScheduler";
    private static final String PREFS_NAME = "alquran_waqt_alarms_prefs";
    private static final String KEY_ALARMS_JSON = "saved_waqt_alarms";

    public static class AlarmItem {
        public int id;
        public String name;
        public long triggerAtMillis;
        public String title;
        public String body;

        public AlarmItem(int id, String name, long triggerAtMillis, String title, String body) {
            this.id = id;
            this.name = name;
            this.triggerAtMillis = triggerAtMillis;
            this.title = title;
            this.body = body;
        }

        public JSONObject toJson() {
            try {
                JSONObject obj = new JSONObject();
                obj.put("id", id);
                obj.put("name", name);
                obj.put("triggerAtMillis", triggerAtMillis);
                obj.put("title", title);
                obj.put("body", body);
                return obj;
            } catch (Exception e) {
                return null;
            }
        }

        public static AlarmItem fromJson(JSONObject obj) {
            try {
                int id = obj.getInt("id");
                String name = obj.optString("name", "");
                long trigger = obj.getLong("triggerAtMillis");
                String title = obj.optString("title", "");
                String body = obj.optString("body", "");
                return new AlarmItem(id, name, trigger, title, body);
            } catch (Exception e) {
                return null;
            }
        }
    }

    public static int scheduleAlarms(Context context, List<AlarmItem> alarms) {
        if (context == null || alarms == null) return 0;

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return 0;

        // Cancel previous alarms first to ensure clean state
        cancelAllAlarms(context);

        long now = System.currentTimeMillis();
        List<AlarmItem> validFutureAlarms = new ArrayList<>();
        int scheduledCount = 0;

        for (AlarmItem alarm : alarms) {
            // Only schedule future alarms (at least 10 seconds ahead)
            if (alarm.triggerAtMillis <= now + 10000L) {
                continue;
            }

            validFutureAlarms.add(alarm);

            try {
                scheduleSingleAlarm(context, alarmManager, alarm);
                scheduledCount++;
            } catch (Exception e) {
                Log.w(TAG, "Failed to schedule alarm: " + alarm.name + " at " + alarm.triggerAtMillis, e);
            }
        }

        saveAlarmsToPrefs(context, validFutureAlarms);
        Log.i(TAG, "Successfully scheduled " + scheduledCount + " Waqt alarms with setAlarmClock");
        return scheduledCount;
    }

    private static void scheduleSingleAlarm(Context context, AlarmManager alarmManager, AlarmItem alarm) {
        Intent intent = new Intent(context, WaqtAlarmReceiver.class);
        intent.setAction(WaqtAlarmReceiver.ACTION_WAQT_ALARM);
        intent.putExtra("waqt_id", alarm.id);
        intent.putExtra("waqt_name", alarm.name);
        intent.putExtra("waqt_title", alarm.title);
        intent.putExtra("waqt_body", alarm.body);
        intent.putExtra("scheduled_time", alarm.triggerAtMillis);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(
            context,
            alarm.id,
            intent,
            flags
        );

        Intent showIntent = new Intent(context, MainActivity.class);
        showIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent showPendingIntent = PendingIntent.getActivity(
            context,
            alarm.id,
            showIntent,
            flags
        );

        // setAlarmClock guarantees waking device from deep Doze mode at the exact second
        AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(
            alarm.triggerAtMillis,
            showPendingIntent
        );

        try {
            alarmManager.setAlarmClock(clockInfo, alarmPendingIntent);
        } catch (SecurityException se) {
            Log.w(TAG, "setAlarmClock restricted, falling back to setExactAndAllowWhileIdle", se);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarm.triggerAtMillis, alarmPendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, alarm.triggerAtMillis, alarmPendingIntent);
            }
        }
    }

    public static void cancelAllAlarms(Context context) {
        if (context == null) return;
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        List<AlarmItem> saved = loadAlarmsFromPrefs(context);

        int flags = PendingIntent.FLAG_NO_CREATE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        if (alarmManager != null) {
            for (AlarmItem item : saved) {
                Intent intent = new Intent(context, WaqtAlarmReceiver.class);
                intent.setAction(WaqtAlarmReceiver.ACTION_WAQT_ALARM);
                PendingIntent pi = PendingIntent.getBroadcast(context, item.id, intent, flags);
                if (pi != null) {
                    alarmManager.cancel(pi);
                    pi.cancel();
                }
            }
        }

        clearAlarmsFromPrefs(context);
        Log.i(TAG, "Cancelled all previously scheduled Waqt alarms.");
    }

    public static void restoreAlarms(Context context) {
        if (context == null) return;
        List<AlarmItem> saved = loadAlarmsFromPrefs(context);
        if (saved.isEmpty()) return;

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        long now = System.currentTimeMillis();
        List<AlarmItem> remaining = new ArrayList<>();
        int restored = 0;

        for (AlarmItem alarm : saved) {
            // Discard any past alarms to ensure no bursts occur after restart
            if (alarm.triggerAtMillis > now + 5000L) {
                remaining.add(alarm);
                try {
                    scheduleSingleAlarm(context, alarmManager, alarm);
                    restored++;
                } catch (Exception e) {
                    Log.w(TAG, "Failed to restore alarm " + alarm.id, e);
                }
            }
        }

        saveAlarmsToPrefs(context, remaining);
        Log.i(TAG, "Restored " + restored + " future Waqt alarms after reboot.");
    }

    private static void saveAlarmsToPrefs(Context context, List<AlarmItem> alarms) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            JSONArray array = new JSONArray();
            for (AlarmItem item : alarms) {
                JSONObject obj = item.toJson();
                if (obj != null) {
                    array.put(obj);
                }
            }
            prefs.edit().putString(KEY_ALARMS_JSON, array.toString()).apply();
        } catch (Exception e) {
            Log.w(TAG, "Failed to save alarms to SharedPreferences", e);
        }
    }

    private static List<AlarmItem> loadAlarmsFromPrefs(Context context) {
        List<AlarmItem> list = new ArrayList<>();
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String json = prefs.getString(KEY_ALARMS_JSON, null);
            if (json != null && !json.isEmpty()) {
                JSONArray array = new JSONArray(json);
                for (int i = 0; i < array.length(); i++) {
                    JSONObject obj = array.getJSONObject(i);
                    AlarmItem item = AlarmItem.fromJson(obj);
                    if (item != null) {
                        list.add(item);
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to load alarms from SharedPreferences", e);
        }
        return list;
    }

    private static void clearAlarmsFromPrefs(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(KEY_ALARMS_JSON).apply();
        } catch (Exception ignored) {}
    }
}
