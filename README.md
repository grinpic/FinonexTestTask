# Finonex mobile automation — iOS

TypeScript + Appium/XCUITest + Mocha, using WebdriverIO and the **Screen Object** pattern.

**Detailed Russian guide:** [Project structure, design, tests, setup and troubleshooting](docs/PROJECT_GUIDE_RU.md).

**Presentation:** [Architecture, test steps and coverage (Russian)](deliverables/Finonex-iOS-Automation-RU.pptx).

## Scope and status

Three scenarios are implemented:

| Scenario         | Verification                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Product sorting  | All six products, preserved names/prices, numeric ascending order                           |
| Drawing — Clear  | Drawing visibly changes the canvas; Clear restores its initial image                        |
| About — rotation | Landscape orientation, viewport/content geometry, accessible controls and successful reload |

In release 2.7.1, **About opens the Sauce Labs website in external Safari**. The test follows that actual behavior. Canvas contains a background logo, so clean means restoration to its original state rather than an all-white bitmap.

All nine device/scenario combinations have passed on BrowserStack real devices across targeted runs. See [execution results and session videos](docs/BROWSERSTACK_RESULTS_RU.md). Local validation results are recorded below.

## Prerequisites

- Node.js 20.19+ and npm.
- Local execution: Xcode and an installed iOS Simulator runtime.
- Cloud execution: a dedicated BrowserStack trial account with App Automate access, unique credentials, and an available iPhone / iOS combination.

BrowserStack provides its own Appium server and WebDriverAgent. Local Appium/XCUITest dependencies are installed with this project; no global installation is needed.

## Install

```sh
npm ci
cp .env.example .env
npm run check
```

Do not overwrite an existing `.env` containing your settings. `check` runs TypeScript, formatting validation, and image-comparison unit tests. It does not start devices or consume cloud minutes.

## Application builds

The latest release checked during setup is [2.7.1](https://github.com/saucelabs/sample-app-mobile/releases/tag/2.7.1); the upstream repository is archived. This project pins that release.

Real-device IPA for BrowserStack:

```sh
mkdir -p apps
curl --fail --location \
  'https://github.com/saucelabs/sample-app-mobile/releases/download/2.7.1/iOS.RealDevice.SauceLabs.Mobile.Sample.app.2.7.1.ipa' \
  --output apps/swaglabs-2.7.1.ipa
```

Simulator build:

```sh
mkdir -p apps
curl --fail --location \
  'https://github.com/saucelabs/sample-app-mobile/releases/download/2.7.1/iOS.Simulator.SauceLabs.Mobile.Sample.app.2.7.1.zip' \
  --output apps/swaglabs-simulator-2.7.1.zip
unzip -q apps/swaglabs-simulator-2.7.1.zip -d apps/simulator
```

IPA and simulator `.app` are not interchangeable. Binaries, `.env`, `node_modules`, and `artifacts` are excluded from Git.

## Local simulator execution

Use a **dedicated** simulator. Find its UDID with `xcrun simctl list devices available`, then set:

```dotenv
IOS_SIMULATOR_UDID=your-simulator-udid
IOS_SIMULATOR_APP=apps/simulator/iOS.Simulator.SauceLabs.Mobile.Sample.app.2.7.1.app
```

Start Appium in one terminal:

```sh
npm run appium:local
```

Run tests in another:

```sh
npm run test:simulator
# Or select a single scenario:
npm run test:simulator -- --spec tests/specs/drawing-clear.spec.ts
npm run test:simulator -- --spec tests/specs/screen-rotation.spec.ts
npm run test:simulator -- --spec tests/specs/product-sorting.spec.ts
```

The development simulator is `Finonex iOS 26`, iPhone 17 Pro / iOS 26.5, UDID `7DF65C49-C251-47D7-A6E9-B0A4373EFE15`. That UDID is machine-specific.

First execution can build WDA; session creation allows ten minutes, including up to five minutes for a fresh simulator boot. `fullReset` is explicitly disabled because it can erase the entire simulator. App language is set with process arguments to avoid restarting system services. If persisted login state interferes, uninstall only the sample app from the dedicated simulator before the next run.

## BrowserStack execution

Upload `apps/swaglabs-2.7.1.ipa` in the [App Automate dashboard](https://app-automate.browserstack.com/), select Appium if prompted, and copy the returned `bs://...` app URL.

Fill in `.env` locally:

```dotenv
BROWSERSTACK_USERNAME=automation_username
BROWSERSTACK_ACCESS_KEY=access_key
BROWSERSTACK_APP_ID=bs://uploaded_app_id
IOS_DEVICE_NAME=exact_available_iPhone_model
IOS_PLATFORM_VERSION=exact_available_iOS_version
BROWSERSTACK_BUILD_NAME=finonex-ios-suite
```

Use exact device/OS values available in your account. The access key is not your account password. The app's built-in `standard_user` autofill supplies its public demo credentials, unrelated to BrowserStack credentials.

```sh
npm test
# Individual scenarios:
npm run test:sorting
npm run test:drawing
npm run test:rotation
```

Missing settings fail before session creation. The local Appium process is not used for cloud runs. One worker runs at a time; test retries are disabled. Repeat the complete suite with three different available device/OS pairs for the required **nine successful executions**. Use `npm run test:matrix` to execute the configured three-device matrix sequentially. Selection rationale and local/cloud OS differences are documented in [the device matrix](docs/DEVICE_MATRIX_RU.md).

## Architecture

```text
config/
  environment.ts                 # Cloud settings and validation
  wdio.shared.conf.ts            # Runner, Mocha, waits and failure hooks
  wdio.browserstack.conf.ts      # Cloud endpoint, capabilities, session status
  wdio.simulator.conf.ts         # Local endpoint, simulator and WDA
tests/
  screens/                       # Login, Products, Drawing, About
  components/side-menu.ts         # Reusable navigation
  specs/                         # Three scenarios and assertions
  support/                       # Price parsing, PNG comparison, evidence
  unit/                          # Pure image verification tests
docs/PROJECT_GUIDE_RU.md         # Detailed developer guide
```

Screen Objects hide locators and gestures; specs own requirement assertions. Elements are retrieved lazily. Each spec has one test and a separate Appium session; adding more tests per spec requires explicit state preparation. Rotation restores portrait and activates the sample app in cleanup.

## Verification details

- **Sorting:** overlapping swipes collect the complete catalog in visual grid order; unique product names deduplicate overlap. Six items is a pinned-release completeness guard. USD labels are parsed into integer cents. The test checks unchanged products/prices as well as sorted order.
- **Canvas:** crop the actual screenshot using WebView bounds and Retina scaling; exclude status/header/buttons and the signature pad's 75-point footer. Capture a same-session baseline, draw a relative-coordinate zigzag, and verify more than 0.1% pixels changed. After Clear require zero changed pixels, with a per-channel noise tolerance of 24/255. Different image dimensions fail explicitly. Unit tests detect residual strokes and validate crop scaling.
- **Rotation:** navigate through ABOUT into Safari, require the Sauce Labs domain and visible web links, rotate, verify landscape geometry and on-screen controls, then reload the site. This is a usability smoke test, not full visual regression of an external website.

## Evidence

- Terminal: Mocha spec results and assertion details.
- `artifacts/logs/`: runner logs.
- `artifacts/<session-id>/<timestamp>-<test>/`: failure screenshot and accessibility XML.
- `artifacts/<session-id>/canvas-*.png`: baseline, drawn, cleared and diff images.
- `canvas-comparison.json`: changed-pixel measurements.
- `about-portrait.png`, `about-landscape.png`, `about-layout.json`: rotation evidence.
- BrowserStack dashboard: status, device, command logs and enabled session video.

Evidence exists only for steps reached. Local artifacts may contain screen data and are not committed. BrowserStack credentials must stay in `.env` or CI secrets.

## Validation and known limitations

- Sorting passed in the complete local run on 2026-10-22: 56.2 seconds, session `e68239d3-e2a8-4c60-9a07-c4825c7d0696`.
- Drawing passed with explicit canvas cropping on 2026-10-22: 22.4 seconds, session `80e6b035-2fec-4406-815d-5b7a3f8011f9`. Drawing changed 0.923% of pixels; Clear left zero changed pixels.
- The complete local run finished with two passing tests and one failure. Rotation initially failed with `Unable To Rotate Device`; restarting the dedicated simulator resolved that error (similar report: [XCUITest driver issue #2829](https://github.com/appium/appium-xcuitest-driver/issues/2829)). The next run successfully rotated but failed because Safari hid its address bar in landscape. A downward swipe to reveal navigation has been added; the final adjustment passed on the development simulator on 2026-10-22 (session `5405a4b0-986e-4358-8cd3-534750ff8ea8`, 1m 43s); validation on the selected matrix is tracked separately. No automatic skip or success fallback is used.
- External Safari content depends on network availability and the live Sauce Labs site; real-device Safari versions may require locator adjustments.
- The legacy application's touchable menu wrappers need a native tap inside the item.
- `npm audit` at local toolchain installation reported 34 entries (20 high, 14 critical), including transitive chains. Remediation remains open. Do not blindly force major framework downgrades proposed by `npm audit fix --force`.
- The downloaded IPA passed archive validation; local SHA-256: `a03cdd61517f491967fcced9f81659bf12ffc96f9081d872c5f4cb2d6420bc17`.

Before submission, record successful executions and accessible video links for all three real devices. Repository publication and final submission are separate steps.

## References

- [Pinned application release](https://github.com/saucelabs/sample-app-mobile/releases/tag/2.7.1)
- [Menu and About implementation](https://github.com/saucelabs/sample-app-mobile/blob/2.7.1/src/js/components/DrawerLinks.js)
- [Drawing implementation](https://github.com/saucelabs/sample-app-mobile/blob/2.7.1/src/js/screens/Drawing.js)
- [BrowserStack WebdriverIO integration](https://www.browserstack.com/docs/app-automate/appium/getting-started/nodejs/webdriverio/integrate-your-tests)
