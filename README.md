# FinonexTestTask

## Goal

Automate three Swag Labs iOS scenarios and run them on three real BrowserStack devices:

- **Product sorting:** read all six products and verify ascending prices without changing the catalog.
- **Drawing / Clear:** draw on the canvas, verify a visible change, tap Clear and compare the canvas with its initial screenshot.
- **Screen rotation:** open About, rotate to landscape and verify layout, available controls and a successful page reload. About opens Safari in this app version.

## Stack

TypeScript, Appium (XCUITest driver), Mocha and WebdriverIO. Screen Objects contain locators and actions. Tests contain assertions. PNG comparison uses `pngjs`.

## Run

Requires **Node.js 20.19+**, npm and internet access. Cloud execution does not require Xcode, a local Appium server or a connected iPhone.

```sh
git clone https://github.com/grinpic/FinonexTestTask.git
cd FinonexTestTask
npm ci
npm run test:matrix
```

This runs all three tests sequentially on **iPhone 17 / iOS 26**, **iPhone 15 Pro / iOS 17** and **iPhone 17 Pro Max / iOS 26**. BrowserStack selects the available patch version.

`exercise.env` includes the dedicated exercise account's API credentials and uploaded app ID. It is intentionally included in this **private repository**. Keep the repository private while these credentials remain active. The Google sign-in password is not needed for test execution. Reviewers can use the [dashboard login instructions](docs/REVIEWER_ACCESS.md) to inspect results and videos. Execution requires remaining BrowserStack minutes, an active account and an available uploaded app.

To use another account, copy `.env.example` to `.env` and fill in its values. Local `.env` and shell variables take priority over `exercise.env`.

### Run fewer tests

```sh
npm test                  # All three tests on iPhone 17
npm run test:sorting      # Sorting only
npm run test:drawing      # Drawing only
npm run test:rotation     # Rotation only
npm run check             # Types, formatting and unit tests; no cloud minutes
```

## Results

The terminal displays pass/fail results. BrowserStack App Automate provides session logs and videos. Local screenshots and diagnostic files appear in `artifacts/`.

All nine device/scenario combinations have successful results across several runs: [sessions and videos](docs/BROWSERSTACK_RESULTS_RU.md). These are recorded results, not a guarantee of a new run while trial access or the external website changes.

## Project structure

- `tests/specs/`: the three scenarios and assertions.
- `tests/screens/`, `tests/components/`: Screen Objects and shared navigation.
- `tests/support/`: shared session setup, screenshot comparison, prices and evidence.

Before each spec, the shared WebdriverIO `before` hook sets portrait, signs in and waits for Products. Each spec has one scenario and a fresh Appium session. The scenario then performs only its own navigation, actions and assertions. Adding multiple tests to one spec requires explicit state isolation.

- `config/`: cloud, simulator and device settings.

[Detailed guide and simulator setup](docs/PROJECT_GUIDE_RU.md) · [Device matrix](docs/DEVICE_MATRIX_RU.md) · [Presentation](deliverables/Finonex-iOS-Automation-RU.pptx)
