package com.alquran.mobile;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidAlarmHelperPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
