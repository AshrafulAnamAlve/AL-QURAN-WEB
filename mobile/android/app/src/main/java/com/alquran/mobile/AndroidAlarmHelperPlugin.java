package com.alquran.mobile;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Native Android helper plugin to ensure 100% reliable real-time Waqt notifications
 * by managing Battery Optimization whitelist, Exact Alarms permissions, and OEM autostart.
 */
@CapacitorPlugin(name = "AndroidAlarmHelper")
public class AndroidAlarmHelperPlugin extends Plugin {

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
            // Fallback to app details
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
