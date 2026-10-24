import { LoginScreen } from '../screens/login.screen.js';
import { SideMenu } from '../components/side-menu.js';
import {
  capturePortraitLayout,
  expectUsableLandscape,
  expectLandscapeOrientation,
} from '../assertions/about.assertions.js';
import { rotateToLandscape, restoreAppInPortrait } from '../support/device.js';

describe('About — screen rotation', () => {
  before('Sign in as standard user', async () => {
    await new LoginScreen().signInAsStandardUser();
  });

  afterEach(restoreAppInPortrait);

  it('rotates About to landscape and keeps its content and controls usable', async () => {
    const about = await new SideMenu().openAbout();
    const portrait = await capturePortraitLayout(about);

    await rotateToLandscape();
    await about.revealNavigation();
    await about.waitForLoaded();
    await expectUsableLandscape(about, portrait);

    await about.reloadPage();
    await expectLandscapeOrientation();
  });
});
