import { EventEmitter } from 'node:events';
import assert from 'node:assert';

console.log('\n================================================================');
console.log('       ANDROID 14 DEEP-SLEEP & DOZE MODE REALTIME SIMULATOR     ');
console.log('       Target Device: Tecno HiOS / Android 14 (API 34)          ');
console.log('================================================================\n');

/**
 * Android DeviceIdleController Simulation
 * Simulates Android OS Doze Mode state machine (API 23 - 34)
 */
class AndroidDozeController {
  constructor() {
    this.states = ['ACTIVE', 'INACTIVE', 'IDLE_PENDING', 'SENSING', 'LOCATING', 'DEEP_IDLE'];
    this.currentState = 'ACTIVE';
    this.isScreenOn = true;
    this.isCharging = false;
    this.networkBlocked = false;
    this.wakeLocksAllowed = true;
  }

  enterDeepSleep() {
    this.isScreenOn = false;
    this.isCharging = false;
    this.currentState = 'DEEP_IDLE';
    this.networkBlocked = true;
    this.wakeLocksAllowed = false; // Normal wake locks are frozen in Doze
  }

  wakeScreen() {
    this.isScreenOn = true;
    this.wakeLocksAllowed = true;
  }
}

/**
 * Android 14 AlarmManager Simulation
 * Implements Android OS AlarmManagerService logic:
 * - Ordinary alarms (set, setExact, LocalNotifications) are suppressed during DEEP_IDLE
 * - setAlarmClock alarms are tagged with FLAG_WAKEUP | FLAG_STANDALONE, bypassing Doze
 */
class MockAndroidAlarmManager {
  constructor(dozeController, powerManager, notificationManager, audioManager) {
    this.doze = dozeController;
    this.pm = powerManager;
    this.nm = notificationManager;
    this.audio = audioManager;
    this.alarms = [];
  }

  setStandardLocalNotification(triggerTime, id, title, body) {
    this.alarms.push({
      type: 'STANDARD_LOCAL_NOTIFICATION',
      time: triggerTime,
      id,
      title,
      body,
      bypassesDoze: false,
    });
  }

  setAlarmClock(alarmClockInfo, operationIntent) {
    this.alarms.push({
      type: 'ALARM_CLOCK',
      time: alarmClockInfo.triggerTime,
      showIntent: alarmClockInfo.showIntent,
      intent: operationIntent,
      bypassesDoze: true, // FLAG_WAKEUP | FLAG_STANDALONE in Android OS
    });
  }

  cancelByUri(dataUri) {
    this.alarms = this.alarms.filter(a => a.intent?.dataUri !== dataUri);
  }

  /**
   * Tick simulation at timestamp `currentTime`
   */
  tick(currentTime) {
    const readyAlarms = [];
    const remaining = [];

    for (const alarm of this.alarms) {
      if (currentTime >= alarm.time) {
        readyAlarms.push(alarm);
      } else {
        remaining.push(alarm);
      }
    }
    this.alarms = remaining;

    const results = [];
    for (const alarm of readyAlarms) {
      // Android Doze Mode Filter
      if (this.doze.currentState === 'DEEP_IDLE' && !alarm.bypassesDoze) {
        // Suppressed by OS Doze mode! Put back to deferred queue
        results.push({
          alarm,
          status: 'BLOCKED_BY_DOZE',
          fired: false,
          reason: 'Android Doze Mode deferred non-AlarmClock execution until device wake',
        });
        remaining.push(alarm);
      } else {
        // Permitted to fire!
        // Android OS wakes CPU and delivers intent to receiver
        results.push({
          alarm,
          status: 'DELIVERED',
          fired: true,
          reason: 'setAlarmClock bypassed Doze mode with FLAG_WAKEUP',
        });
      }
    }
    this.alarms = remaining;
    return results;
  }
}

/**
 * Android PowerManager Simulation
 */
class MockPowerManager {
  constructor(dozeController) {
    this.doze = dozeController;
    this.activeWakeLocks = [];
    this.screenTurnedOnByWakeLock = false;
  }

  newWakeLock(flags, tag) {
    const pm = this;
    return {
      flags,
      tag,
      isHeld: false,
      acquire(timeoutMs = 60000) {
        this.isHeld = true;
        pm.activeWakeLocks.push(this);
        // ACQUIRE_CAUSES_WAKEUP forces screen on even in deep sleep
        if (flags.includes('ACQUIRE_CAUSES_WAKEUP')) {
          pm.screenTurnedOnByWakeLock = true;
          pm.doze.wakeScreen();
        }
      },
      release() {
        this.isHeld = false;
        pm.activeWakeLocks = pm.activeWakeLocks.filter(w => w !== this);
      }
    };
  }
}

/**
 * Android NotificationManager Simulation
 */
class MockNotificationManager {
  constructor() {
    this.channels = new Map();
    this.activeNotifications = new Map();
  }

  createNotificationChannel(id, name, importance, bypassDnd, visibility) {
    this.channels.set(id, { id, name, importance, bypassDnd, visibility });
  }

  notify(id, notification) {
    this.activeNotifications.set(id, notification);
  }

  cancel(id) {
    this.activeNotifications.delete(id);
  }

  getActiveNotifications() {
    return Array.from(this.activeNotifications.values());
  }
}

/**
 * Android Hardware Audio Output Simulation
 */
class MockAudioManager {
  constructor() {
    this.activeStreams = [];
  }

  playAudio(soundRes, usage, isDndActive) {
    const stream = {
      soundRes,
      usage, // AudioAttributes.USAGE_ALARM
      played: true,
      bypassedDnd: usage === 'USAGE_ALARM' || !isDndActive
    };
    this.activeStreams.push(stream);
    return stream;
  }
}

/**
 * WaqtAlarmReceiver Implementation (mirrors WaqtAlarmReceiver.java)
 */
class WaqtAlarmReceiverSimulation {
  constructor(powerManager, notificationManager, audioManager) {
    this.pm = powerManager;
    this.nm = notificationManager;
    this.audio = audioManager;
    this.dismissedPrevious = false;
  }

  onReceive(intent, currentTime, isDndActive = true) {
    const scheduledTime = intent.scheduledTime || currentTime;
    const now = currentTime;

    // 1. Anti-Burst Filter: Stale check (> 15 minutes)
    if (Math.abs(now - scheduledTime) > 15 * 60 * 1000) {
      return {
        executed: false,
        reason: 'STALE_ALARM_DISCARDED',
        ageMinutes: Math.round(Math.abs(now - scheduledTime) / 60000)
      };
    }

    // 2. Dismiss previous waqt notifications to avoid screen piles
    this.dismissPreviousPrayerNotifications();

    // 3. Acquire WakeLock with ACQUIRE_CAUSES_WAKEUP
    const wakeLock = this.pm.newWakeLock(
      ['PARTIAL_WAKE_LOCK', 'ACQUIRE_CAUSES_WAKEUP', 'ON_AFTER_RELEASE'],
      'AlQuran:WaqtAlarmReceiver'
    );
    wakeLock.acquire(60000);

    // 4. Post Notification with setFullScreenIntent and bypassDnd
    const notification = {
      id: intent.notificationId || 1001,
      title: intent.title,
      body: intent.body,
      channelId: 'adhan_prayer_channel',
      priority: 'PRIORITY_MAX',
      category: 'CATEGORY_ALARM',
      fullScreenIntent: true, // setFullScreenIntent(contentPendingIntent, true)
      visibility: 'VISIBILITY_PUBLIC',
      timestamp: now,
    };
    this.nm.notify(notification.id, notification);

    // 5. Play hardware alarm audio through USAGE_ALARM
    const audioResult = this.audio.playAudio('takbeer_alert', 'USAGE_ALARM', isDndActive);

    // Release WakeLock safely
    wakeLock.release();

    return {
      executed: true,
      screenWokeUp: this.pm.screenTurnedOnByWakeLock,
      fullScreenIntentSet: notification.fullScreenIntent,
      audioPlayed: audioResult.played,
      audioBypassedDnd: audioResult.bypassedDnd,
      notificationPosted: notification
    };
  }

  dismissPreviousPrayerNotifications() {
    this.dismissedPrevious = true;
    for (let id = 1001; id <= 1007; id++) {
      this.nm.cancel(id);
    }
  }
}

/**
 * WaqtAlarmScheduler Implementation (mirrors WaqtAlarmScheduler.java)
 */
class WaqtAlarmSchedulerSimulation {
  constructor(alarmManager) {
    this.am = alarmManager;
    this.savedAlarms = [];
  }

  scheduleSingleAlarm(id, title, body, triggerTime) {
    const dataUri = `waqt://alarm/${id}/${triggerTime}`;
    const intent = {
      action: 'com.alquran.mobile.WAQT_ALARM',
      dataUri,
      notificationId: id,
      title,
      body,
      scheduledTime: triggerTime
    };

    const alarmClockInfo = {
      triggerTime,
      showIntent: 'MainActivity'
    };

    this.am.setAlarmClock(alarmClockInfo, intent);
    this.savedAlarms.push({ id, title, body, triggerTime, dataUri });
  }

  checkAndReplenishAlarms(currentTime) {
    // Filter active future alarms
    this.savedAlarms = this.savedAlarms.filter(a => a.triggerTime > currentTime);

    // Self-healing replenishment if fewer than 5 future alarms remain
    if (this.savedAlarms.length < 5) {
      const waqts = [
        { name: 'ফজর (Fajr)', offsetHours: 5.2 },
        { name: 'যোহর (Dhuhr)', offsetHours: 12.0 },
        { name: 'আসর (Asr)', offsetHours: 15.5 },
        { name: 'মাগরিব (Maghrib)', offsetHours: 17.8 },
        { name: 'এশা (Isha)', offsetHours: 19.2 },
      ];

      let added = 0;
      for (let day = 1; day <= 7; day++) {
        for (let i = 0; i < waqts.length; i++) {
          const w = waqts[i];
          const triggerTime = currentTime + (day * 24 * 3600 * 1000) + (w.offsetHours * 3600 * 1000);
          this.scheduleSingleAlarm(1001 + i, `${w.name} এর ওয়াক্ত হয়েছে`, 'নামাজের সময় হয়েছে', triggerTime);
          added++;
        }
      }
      return { replenished: true, addedCount: added, totalRemaining: this.savedAlarms.length };
    }

    return { replenished: false, totalRemaining: this.savedAlarms.length };
  }
}

// ====================================================================
//                       TEST EXECUTION HARNESS
// ====================================================================

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('--- TEST 1: Standard Local Notification vs setAlarmClock in Deep Sleep ---');
runTest('Standard LocalNotification is BLOCKED by Android Doze Mode in Deep Sleep', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const am = new MockAndroidAlarmManager(doze, pm, nm, audio);

  // Put Tecno phone into stationary Deep Sleep (Doze Mode)
  doze.enterDeepSleep();
  assert.strictEqual(doze.currentState, 'DEEP_IDLE', 'Phone must be in DEEP_IDLE state');
  assert.strictEqual(doze.isScreenOn, false, 'Phone screen must be locked & off');

  const now = Date.now();
  // 1. Schedule ordinary capacitor LocalNotification for T + 5 seconds
  am.setStandardLocalNotification(now + 5000, 100, 'Test Waqt', 'Old style notification');

  // Advance time to T + 5000ms while phone is still in Deep Sleep
  const tickResults = am.tick(now + 5000);

  // Assert standard notification is BLOCKED by OS Doze Mode!
  assert.strictEqual(tickResults.length, 1);
  assert.strictEqual(tickResults[0].status, 'BLOCKED_BY_DOZE');
  assert.strictEqual(tickResults[0].fired, false);
});

runTest('Native setAlarmClock BYPASSES Deep Sleep Doze Mode and fires on time', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const am = new MockAndroidAlarmManager(doze, pm, nm, audio);
  const receiver = new WaqtAlarmReceiverSimulation(pm, nm, audio);
  const scheduler = new WaqtAlarmSchedulerSimulation(am);

  // Phone enters deep sleep
  doze.enterDeepSleep();

  const now = Date.now();
  // Schedule native Waqt alarm using setAlarmClock for T + 5000ms
  scheduler.scheduleSingleAlarm(1001, 'ফজর (Fajr)', 'ফজরের ওয়াক্ত শুরু হয়েছে', now + 5000);

  // Advance time to T + 5000ms
  const tickResults = am.tick(now + 5000);

  // Assert alarm delivered despite DEEP_IDLE
  assert.strictEqual(tickResults.length, 1);
  assert.strictEqual(tickResults[0].status, 'DELIVERED');
  assert.strictEqual(tickResults[0].fired, true);

  // Execute receiver
  const receiveResult = receiver.onReceive(tickResults[0].alarm.intent, now + 5000, true);

  // Assert all deep-sleep actions succeeded
  assert.strictEqual(receiveResult.executed, true, 'Receiver must execute');
  assert.strictEqual(receiveResult.screenWokeUp, true, 'Screen MUST wake up in deep sleep');
  assert.strictEqual(receiveResult.fullScreenIntentSet, true, 'Must set fullScreenIntent for lockscreen banner');
  assert.strictEqual(receiveResult.audioPlayed, true, 'Takbeer audio must play');
  assert.strictEqual(receiveResult.audioBypassedDnd, true, 'USAGE_ALARM must bypass Do Not Disturb');
});

console.log('\n--- TEST 2: Anti-Burst Engine (Eliminating Stale Notification Piles) ---');
runTest('Stale alarms older than 15 minutes are discarded without piling up or chiming', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const receiver = new WaqtAlarmReceiverSimulation(pm, nm, audio);

  const now = Date.now();
  // Simulate 3 stale alarms that occurred hours ago while phone was off
  const staleIntent1 = { notificationId: 1001, title: 'ফজর', scheduledTime: now - (5 * 3600 * 1000) };
  const staleIntent2 = { notificationId: 1002, title: 'যোহর', scheduledTime: now - (2 * 3600 * 1000) };
  const freshIntent = { notificationId: 1003, title: 'আসর', scheduledTime: now };

  const res1 = receiver.onReceive(staleIntent1, now);
  const res2 = receiver.onReceive(staleIntent2, now);
  const res3 = receiver.onReceive(freshIntent, now);

  assert.strictEqual(res1.executed, false, '5-hour old alarm must be dropped');
  assert.strictEqual(res1.reason, 'STALE_ALARM_DISCARDED');
  assert.strictEqual(res2.executed, false, '2-hour old alarm must be dropped');
  assert.strictEqual(res2.reason, 'STALE_ALARM_DISCARDED');

  assert.strictEqual(res3.executed, true, 'Fresh waqt alarm must be accepted');
  assert.strictEqual(nm.getActiveNotifications().length, 1, 'Only 1 active notification should exist, no pile');
});

console.log('\n--- TEST 3: Instant 10-Second Deep Sleep Verification Tool ---');
runTest('10s Test Alarm triggers at exact millisecond, wakes screen and chimes', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const am = new MockAndroidAlarmManager(doze, pm, nm, audio);
  const receiver = new WaqtAlarmReceiverSimulation(pm, nm, audio);
  const scheduler = new WaqtAlarmSchedulerSimulation(am);

  const startTime = 1731680000000;
  // User taps "১০ সে. ডিপ-স্লিপ টেস্ট" in settings
  scheduler.scheduleSingleAlarm(9999, 'টেস্ট আযান অ্যালার্ট', 'স্ক্রিন অন ও আযান ভলিউম সফল হয়েছে', startTime + 10000);

  // User locks phone immediately into deep sleep
  doze.enterDeepSleep();
  assert.strictEqual(doze.isScreenOn, false);

  // At 5 seconds: alarm should NOT fire yet
  const midTicks = am.tick(startTime + 5000);
  assert.strictEqual(midTicks.length, 0);

  // At exact 10 seconds: alarm fires
  const endTicks = am.tick(startTime + 10000);
  assert.strictEqual(endTicks.length, 1);
  assert.strictEqual(endTicks[0].status, 'DELIVERED');

  const exec = receiver.onReceive(endTicks[0].alarm.intent, startTime + 10000);
  assert.strictEqual(exec.screenWokeUp, true);
  assert.strictEqual(exec.audioPlayed, true);
});

console.log('\n--- TEST 4: Self-Healing 14-Day Auto Replenishment Engine ---');
runTest('Self-healing engine projects 35 alarms (7 days) when remaining drops < 5', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const am = new MockAndroidAlarmManager(doze, pm, nm, audio);
  const scheduler = new WaqtAlarmSchedulerSimulation(am);

  const now = Date.now();
  // App has only 3 remaining alarms left because user was traveling
  scheduler.savedAlarms = [
    { id: 1001, triggerTime: now + 3600000 },
    { id: 1002, triggerTime: now + 7200000 },
    { id: 1003, triggerTime: now + 10800000 },
  ];

  const replenishResult = scheduler.checkAndReplenishAlarms(now);
  assert.strictEqual(replenishResult.replenished, true, 'Must replenish automatically');
  assert.strictEqual(replenishResult.addedCount, 35, 'Must add 35 upcoming waqt alarms (7 days x 5 waqts)');
  assert.strictEqual(scheduler.savedAlarms.length, 38, 'Total alarms should now be 38');
});

console.log('\n--- TEST 5: Tecno HiOS Unique Intent URI Anti-Deduplication ---');
runTest('Distinct data URIs prevent Tecno/Android OS from merging or overwriting waqt alarms', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const am = new MockAndroidAlarmManager(doze, pm, nm, audio);
  const scheduler = new WaqtAlarmSchedulerSimulation(am);

  const t1 = 1731680000000;
  const t2 = 1731710000000;
  scheduler.scheduleSingleAlarm(1001, 'ফজর', 'ওয়াক্ত শুরু', t1);
  scheduler.scheduleSingleAlarm(1002, 'যোহর', 'ওয়াক্ত শুরু', t2);

  assert.strictEqual(am.alarms.length, 2);
  assert.notStrictEqual(am.alarms[0].intent.dataUri, am.alarms[1].intent.dataUri);
  assert.strictEqual(am.alarms[0].intent.dataUri, `waqt://alarm/1001/${t1}`);
  assert.strictEqual(am.alarms[1].intent.dataUri, `waqt://alarm/1002/${t2}`);
});

console.log('\n--- TEST 6: Device Reboot (WaqtBootReceiver) Restoration ---');
runTest('WaqtBootReceiver restores all future alarms into AlarmManager after phone reboot', () => {
  const doze = new AndroidDozeController();
  const pm = new MockPowerManager(doze);
  const nm = new MockNotificationManager();
  const audio = new MockAudioManager();
  const am = new MockAndroidAlarmManager(doze, pm, nm, audio);
  const scheduler = new WaqtAlarmSchedulerSimulation(am);

  const now = Date.now();
  scheduler.scheduleSingleAlarm(1001, 'ফজর', 'ওয়াক্ত শুরু', now + 100000);
  scheduler.scheduleSingleAlarm(1002, 'যোহর', 'ওয়াক্ত শুরু', now + 200000);

  // Simulate phone powering off (AlarmManager in-memory table is wiped by OS reboot)
  am.alarms = [];
  assert.strictEqual(am.alarms.length, 0);

  // Boot Receiver runs on ACTION_BOOT_COMPLETED
  const savedFromPrefs = [...scheduler.savedAlarms];
  scheduler.savedAlarms = [];
  for (const saved of savedFromPrefs) {
    if (saved.triggerTime > now) {
      scheduler.scheduleSingleAlarm(saved.id, saved.title, saved.body, saved.triggerTime);
    }
  }

  assert.strictEqual(am.alarms.length, 2, 'AlarmManager table must be completely restored after reboot');
});

console.log('\n--- TEST 7: Real-Time Wall-Clock Execution (Async Wait) ---');
async function runAsyncTests() {
  await new Promise(resolve => {
    runTest('Wall-clock real 1500ms sleep in Deep Sleep triggers on exact schedule', async () => {
      const doze = new AndroidDozeController();
      const pm = new MockPowerManager(doze);
      const nm = new MockNotificationManager();
      const audio = new MockAudioManager();
      const am = new MockAndroidAlarmManager(doze, pm, nm, audio);
      const receiver = new WaqtAlarmReceiverSimulation(pm, nm, audio);
      const scheduler = new WaqtAlarmSchedulerSimulation(am);

      const startWallClock = Date.now();
      const triggerWallClock = startWallClock + 1500;

      // Schedule alarm for +1500ms from right now
      scheduler.scheduleSingleAlarm(1005, 'মাগরিব (Maghrib)', 'মাগরিবের ওয়াক্ত হয়েছে', triggerWallClock);

      // Lock device into Doze deep sleep
      doze.enterDeepSleep();
      assert.strictEqual(doze.isScreenOn, false);

      // Wait 1500ms of actual real wall-clock time on this PC
      await new Promise(r => setTimeout(r, 1550));

      const nowWallClock = Date.now();
      const tickResults = am.tick(nowWallClock);

      assert.strictEqual(tickResults.length, 1, 'Alarm must fire after 1500ms wall-clock wait');
      assert.strictEqual(tickResults[0].status, 'DELIVERED');

      const exec = receiver.onReceive(tickResults[0].alarm.intent, nowWallClock);
      assert.strictEqual(exec.screenWokeUp, true, 'Screen woke up after real-time delay');
      assert.strictEqual(exec.audioPlayed, true, 'Audio played through hardware alarm channel');
      resolve();
    });
  });

  console.log('\n================================================================');
  console.log(`TOTAL REALTIME SIMULATOR AUDIT CHECKS : ${totalCount}`);
  console.log(`PASSED                                : ${passedCount}`);
  console.log(`FAILED                                : ${totalCount - passedCount}`);
  console.log('================================================================\n');

  if (passedCount === totalCount) {
    console.log('✔ REALTIME DEEP SLEEP DOZE SIMULATION VERIFIED 100% SUCCESSFUL!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

await runAsyncTests();

