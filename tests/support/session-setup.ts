import { browser } from '@wdio/globals';
import { LoginScreen } from '../screens/login.screen.js';
import { captureFailure } from './artifacts.js';

/** Runs once in each fresh Appium session, before its single scenario. */
export async function prepareSession(): Promise<void> {
  try {
    await browser.setOrientation('PORTRAIT');
    await new LoginScreen().signInAsStandardUser();
  } catch (error) {
    // Setup failures must retain evidence even though the test body never runs.
    try {
      await captureFailure('session-setup');
    } catch (captureError) {
      console.warn('Setup artifact collection failed:', captureError);
    }
    throw error;
  }
}
