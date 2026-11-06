import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('\n======================================================');
console.log('       WAQT BACKGROUND ALARM RELIABILITY AUDIT        ');
console.log('======================================================\n');

let passed = 0;
let failed = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`  ✔ PASS ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL ${title}: ${err.message}`);
    failed++;
  }
}

// 1. WaqtAlarmReceiver.java checks
check('WaqtAlarmReceiver exists and implements stale alarm protection & WakeLock', () => {
  const receiverPath = path.resolve('android/app/src/main/java/com/alquran/mobile/WaqtAlarmReceiver.java');
  assert(fs.existsSync(receiverPath), 'WaqtAlarmReceiver.java does not exist');
  const content = fs.readFileSync(receiverPath, 'utf8');

  assert(content.includes('PARTIAL_WAKE_LOCK'), 'Missing PARTIAL_WAKE_LOCK in WaqtAlarmReceiver');
  assert(content.includes('15 * 60 * 1000L'), 'Missing 15-minute stale alarm rejection check');
  assert(content.includes('adhan_prayer_channel'), 'Missing adhan_prayer_channel channel id');
  assert(content.includes('dismissPreviousPrayerNotifications'), 'Missing dismissPreviousPrayerNotifications method');
  assert(content.includes('USAGE_ALARM'), 'Missing USAGE_ALARM in AudioAttributes');
});

// 2. WaqtBootReceiver.java checks
check('WaqtBootReceiver exists and handles boot actions', () => {
  const bootPath = path.resolve('android/app/src/main/java/com/alquran/mobile/WaqtBootReceiver.java');
  assert(fs.existsSync(bootPath), 'WaqtBootReceiver.java does not exist');
  const content = fs.readFileSync(bootPath, 'utf8');

  assert(content.includes('ACTION_BOOT_COMPLETED'), 'Missing ACTION_BOOT_COMPLETED');
  assert(content.includes('QUICKBOOT_POWERON'), 'Missing QUICKBOOT_POWERON');
  assert(content.includes('restoreAlarms'), 'Missing restoreAlarms call');
});

// 3. WaqtAlarmScheduler.java checks
check('WaqtAlarmScheduler uses AlarmManager.setAlarmClock for Doze immunity', () => {
  const schedPath = path.resolve('android/app/src/main/java/com/alquran/mobile/WaqtAlarmScheduler.java');
  assert(fs.existsSync(schedPath), 'WaqtAlarmScheduler.java does not exist');
  const content = fs.readFileSync(schedPath, 'utf8');

  assert(content.includes('setAlarmClock'), 'Missing setAlarmClock() in scheduler');
  assert(content.includes('AlarmClockInfo'), 'Missing AlarmClockInfo in scheduler');
  assert(content.includes('setExactAndAllowWhileIdle'), 'Missing fallback to setExactAndAllowWhileIdle');
  assert(content.includes('saveAlarmsToPrefs'), 'Missing saveAlarmsToPrefs persistence');
  assert(content.includes('restoreAlarms'), 'Missing restoreAlarms implementation');
});

// 4. AndroidManifest.xml registration
check('AndroidManifest.xml registers receivers and exact alarm permissions', () => {
  const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
  const content = fs.readFileSync(manifestPath, 'utf8');

  assert(content.includes('WaqtAlarmReceiver'), 'WaqtAlarmReceiver not registered in AndroidManifest.xml');
  assert(content.includes('WaqtBootReceiver'), 'WaqtBootReceiver not registered in AndroidManifest.xml');
  assert(content.includes('SCHEDULE_EXACT_ALARM'), 'Missing SCHEDULE_EXACT_ALARM');
  assert(content.includes('USE_EXACT_ALARM'), 'Missing USE_EXACT_ALARM');
  assert(content.includes('RECEIVE_BOOT_COMPLETED'), 'Missing RECEIVE_BOOT_COMPLETED');
  assert(content.includes('WAKE_LOCK'), 'Missing WAKE_LOCK');
});

// 5. AndroidAlarmHelperPlugin.java methods
check('AndroidAlarmHelperPlugin exposes native scheduling and tap routing', () => {
  const pluginPath = path.resolve('android/app/src/main/java/com/alquran/mobile/AndroidAlarmHelperPlugin.java');
  const content = fs.readFileSync(pluginPath, 'utf8');

  assert(content.includes('scheduleWaqtAlarms'), 'Missing scheduleWaqtAlarms method');
  assert(content.includes('cancelWaqtAlarms'), 'Missing cancelWaqtAlarms method');
  assert(content.includes('sendImmediateTestAlarm'), 'Missing sendImmediateTestAlarm method');
  assert(content.includes('isExactAlarmGranted'), 'Missing isExactAlarmGranted method');
  assert(content.includes('onNotificationTapped'), 'Missing onNotificationTapped method');
  assert(content.includes('getLaunchNotification'), 'Missing getLaunchNotification method');
});

// 6. MobileHardwareService TypeScript integration
check('MobileHardwareService routes Android alarms to native setAlarmClock and purges LocalNotifications queue', () => {
  const tsPath = path.resolve('../frontend/src/app/core/services/mobile-hardware.service.ts');
  const content = fs.readFileSync(tsPath, 'utf8');

  assert(content.includes('AndroidAlarmHelper.scheduleWaqtAlarms'), 'Missing call to AndroidAlarmHelper.scheduleWaqtAlarms');
  assert(content.includes('LocalNotifications.getPending()'), 'Missing LocalNotifications queue cleanup');
  assert(content.includes('waqtAlarmTapped'), 'Missing waqtAlarmTapped listener');
  assert(content.includes('isExactAlarmGranted'), 'Missing isExactAlarmGranted check in interface');
});

console.log('\n======================================================');
console.log(`TOTAL AUDIT CHECKS : ${passed + failed}`);
console.log(`PASSED             : ${passed}`);
console.log(`FAILED             : ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✔ ALL WAQT BACKGROUND ALARM RELIABILITY CHECKS PASSED!\n');
}
