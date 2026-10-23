import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in.`,
    );
  return value;
}

export const environment = {
  username: required('BROWSERSTACK_USERNAME'),
  accessKey: required('BROWSERSTACK_ACCESS_KEY'),
  appId: required('BROWSERSTACK_APP_ID'),
  deviceName:
    process.env.IOS_MATRIX === 'true' ? '' : required('IOS_DEVICE_NAME'),
  platformVersion:
    process.env.IOS_MATRIX === 'true' ? '' : required('IOS_PLATFORM_VERSION'),
  buildName: process.env.BROWSERSTACK_BUILD_NAME || 'finonex-ios-suite',
};

if (!environment.appId.startsWith('bs://')) {
  throw new Error(
    'BROWSERSTACK_APP_ID must be the bs:// URL returned after uploading the IPA.',
  );
}
