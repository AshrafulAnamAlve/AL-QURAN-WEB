package com.alquran.mobile;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Native BroadcastReceiver that restores scheduled Waqt alarms upon device restart
 * or app package update so prayer alarms ring on time without requiring the user
 * to manually open the app.
 */
public class WaqtBootReceiver extends BroadcastReceiver {
    private static final String TAG = "WaqtBootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        Log.i(TAG, "WaqtBootReceiver triggered with action: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || "android.intent.action.QUICKBOOT_POWERON".equals(action)
                || "com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {

            try {
                WaqtAlarmScheduler.restoreAlarms(context);
                Log.i(TAG, "Successfully restored Waqt alarms on device reboot.");
            } catch (Exception e) {
                Log.e(TAG, "Error restoring Waqt alarms on boot", e);
            }
        }
    }
}
