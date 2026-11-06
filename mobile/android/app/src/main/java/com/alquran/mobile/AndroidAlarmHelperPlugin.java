package com.alquran.mobile;

import android.app.AlarmManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/**
 * Native Android helper plugin to ensure 100% reliable real-time Waqt notifications
 * by managing Battery Optimization whitelist, Exact Alarms permissions, OEM autostart,
 * and high-priority AlarmManager.setAlarmClock() scheduling.
 */
@CapacitorPlugin(name = "AndroidAlarmHelper")
public class AndroidAlarmHelperPlugin extends Plugin {
    private static final String TAG = "AndroidAlarmHelper";

    private static String pendingTappedWaqt = null;
    private static AndroidAlarmHelperPlugin activeInstance = null;

    @Override
    public void load() {
        super.load();
        activeInstance = this;
        if (pendingTappedWaqt != null) {
            JSObject ret = new JSObject();
            ret.put("waqtName", pendingTappedWaqt);
            notifyListeners("waqtAlarmTapped", ret);
            pendingTappedWaqt = null;
        }
    }

    /**
     * Broadcasts notification tap event to TypeScript listeners.
     */
    public static void onNotificationTapped(String waqtName) {
        if (waqtName == null || waqtName.isEmpty()) return;
        if (activeInstance != null) {
            JSObject ret = new JSObject();
            ret.put("waqtName", waqtName);
            activeInstance.notifyListeners("waqtAlarmTapped", ret);
        } else {
            pendingTappedWaqt = waqtName;
        }
    }

    /**
     * Returns the Waqt name from the notification that launched or brought the app to foreground.
     */
    @PluginMethod
    public void getLaunchNotification(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("waqtName", pendingTappedWaqt != null ? pendingTappedWaqt : "");
        pendingTappedWaqt = null;
        call.resolve(ret);
    }

    /**
     * Schedules native Waqt alarms using AlarmManager.setAlarmClock()
     * for guaranteed on-time delivery even in deep Doze mode.
     */
    @PluginMethod
    public void scheduleWaqtAlarms(PluginCall call) {
        try {
            JSArray alarmsArray = call.getArray("alarms");
            if (alarmsArray == null) {
                call.reject("alarms array is required");
                return;
            }

            List<WaqtAlarmScheduler.AlarmItem> list = new ArrayList<>();
            for (int i = 0; i < alarmsArray.length(); i++) {
                JSONObject obj = alarmsArray.getJSONObject(i);
                int id = obj.getInt("id");
                String name = obj.optString("name", "");
                long triggerAtMillis = obj.getLong("time");
                String title = obj.optString("title", "");
                String body = obj.optString("body", "");
                list.add(new WaqtAlarmScheduler.AlarmItem(id, name, triggerAtMillis, title, body));
            }

            int scheduled = WaqtAlarmScheduler.scheduleAlarms(getContext(), list);
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("count", scheduled);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling Waqt alarms", e);
            call.reject("Failed to schedule Waqt alarms: " + e.getMessage(), e);
        }
    }

    /**
     * Cancels all native Waqt alarms.
     */
    @PluginMethod
    public void cancelWaqtAlarms(PluginCall call) {
        try {
            WaqtAlarmScheduler.cancelAllAlarms(getContext());
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling Waqt alarms", e);
            call.reject("Failed to cancel alarms: " + e.getMessage(), e);
        }
    }

    /**
     * Triggers an immediate native test notification with Adhan sound to verify alarm delivery.
     */
    @PluginMethod
    public void sendImmediateTestAlarm(PluginCall call) {
        try {
            String title = call.getString("title", "🕌 পরীক্ষা: আযান ও নোটিফিকেশন");
            String body = call.getString("body", "আল-কুরআন ব্যাকগ্রাউন্ড নোটিফিকেশন সফলভাবে কাজ করছে।");
            String waqtName = call.getString("waqtName", "asr");

            Intent intent = new Intent(getContext(), WaqtAlarmReceiver.class);
            intent.setAction(WaqtAlarmReceiver.ACTION_WAQT_ALARM);
            intent.putExtra("waqt_id", 9999);
            intent.putExtra("waqt_name", waqtName);
            intent.putExtra("waqt_title", title);
            intent.putExtra("waqt_body", body);
            intent.putExtra("scheduled_time", System.currentTimeMillis());

            getContext().sendBroadcast(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error sending test alarm", e);
            call.reject("Failed to send test alarm: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if exact alarm permission is granted (Android 12+).
     */
    @PluginMethod
    public void isExactAlarmGranted(PluginCall call) {
        boolean isGranted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                isGranted = am.canScheduleExactAlarms();
            }
        }
        JSObject ret = new JSObject();
        ret.put("isGranted", isGranted);
        call.resolve(ret);
    }

    /**
     * Checks if the app is whitelisted from Android battery optimizations.
     */
    @PluginMethod
    public void isBatteryOptimizationIgnored(PluginCall call) {
        Context context = getContext();
        boolean isIgnored = true;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                isIgnored = pm.isIgnoringBatteryOptimizations(context.getPackageName());
            }
        }

        JSObject ret = new JSObject();
        ret.put("isIgnored", isIgnored);
        call.resolve(ret);
    }

    /**
     * Prompts the user with the system dialog to whitelist the app from battery optimizations.
     */
    @PluginMethod
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        Context context = getContext();
        boolean requested = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(context.getPackageName())) {
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                    requested = true;
                } catch (Exception e) {
                    try {
                        Intent fallback = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                        fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(fallback);
                        requested = true;
                    } catch (Exception ignored) {}
                }
            }
        }

        JSObject ret = new JSObject();
        ret.put("requested", requested);
        call.resolve(ret);
    }

    /**
     * Opens system battery optimization settings screen.
     */
    @PluginMethod
    public void openBatteryOptimizationSettings(PluginCall call) {
        Context context = getContext();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } else {
                openAppSettingsInternal(context);
            }
        } catch (Exception e) {
            openAppSettingsInternal(context);
        }
        call.resolve();
    }

    /**
     * Opens Android 12+ Alarms & Reminders system screen.
     */
    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        Context context = getContext();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } else {
                openAppSettingsInternal(context);
            }
        } catch (Exception e) {
            openAppSettingsInternal(context);
        }
        call.resolve();
    }

    /**
     * Opens the app's application details settings page.
     */
    @PluginMethod
    public void openAppSettings(PluginCall call) {
        Context context = getContext();
        openAppSettingsInternal(context);
        call.resolve();
    }

    /**
     * Attempts to open device manufacturer specific Autostart / Background activity settings.
     */
    @PluginMethod
    public void openAutoStartSettings(PluginCall call) {
        Context context = getContext();
        boolean opened = false;
        String manufacturer = Build.MANUFACTURER.toLowerCase();

        Intent intent = new Intent();
        try {
            if (manufacturer.contains("xiaomi") || manufacturer.contains("redmi") || manufacturer.contains("poco")) {
                intent.setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
            } else if (manufacturer.contains("oppo") || manufacturer.contains("realme")) {
                intent.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
            } else if (manufacturer.contains("vivo")) {
                intent.setComponent(new ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"));
            } else if (manufacturer.contains("huawei") || manufacturer.contains("honor")) {
                intent.setComponent(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"));
            } else if (manufacturer.contains("samsung")) {
                intent.setComponent(new ComponentName("com.samsung.android.lool", "com.samsung.android.sm.battery.ui.BatteryActivity"));
            }

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            opened = true;
        } catch (Exception e) {
            openAppSettingsInternal(context);
        }

        JSObject ret = new JSObject();
        ret.put("opened", opened);
        call.resolve(ret);
    }

    private void openAppSettingsInternal(Context context) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + context.getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception ignored) {}
    }
}
