# Auth Manager SDK for Firebase Auth Module

[![npm Version](https://img.shields.io/npm/v/react-native-auth-manager.svg)](https://www.npmjs.com/package/react-native-auth-manager) [![License](https://img.shields.io/npm/l/react-native-auth-manager.svg)](https://www.npmjs.com/package/react-native-auth-manager)

Gyroscope animation effect for React Native (iOS and Android)

This module is designed for easy implementation of interactive animation that responds to changing the position of the device in real time

## Installation ( only React Native >= 0.60.0)

Install `react-native-auth-manager` (latest):

```bash
yarn add react-native-auth-manager
```

## Installation Google SignIn module

```bash
yarn add @react-native-community/google-signin
```

Then follow the [Android guide](docs/android-guide.md) and [iOS guide](docs/ios-guide.md)

## Installation Facebook SDK module

```bash
yarn add react-native-fbsdk
```

### Configure projects

#### 3.1 Android

Before you can run the project, follow the [Getting Started Guide](https://developers.facebook.com/docs/android/getting-started/) for Facebook Android SDK to set up a Facebook app. You can skip the build.gradle changes since that's taken care of by the rnpm link step above, but **make sure** you follow the rest of the steps such as updating `strings.xml` and `AndroidManifest.xml`.

#### 3.2 iOS

Follow ***steps 3 and 4*** in the [Getting Started Guide](https://developers.facebook.com/docs/ios/getting-started/?sdk=cocoapods) for Facebook SDK for iOS.

**If you're not using cocoapods already** you can also follow step 1.1 to set it up.

**If you're using React Native's RCTLinkingManager**

The `AppDelegate.m` file can only have one method for `openUrl`. If you're also using `RCTLinkingManager` to handle deep links, you should handle both results in your `openUrl` method.

```objc
- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
    return YES;
  }

  if ([RCTLinkingManager application:app openURL:url options:options]) {
    return YES;
  }

  return NO;
}
```

## Installation Apple Auth module

```bash
yarn add @invertase/react-native-apple-authentication
```

## Installation Firebase SDK

```bash
yarn add @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/storage 
```

## Usage


Auth Manager can be used in a declarative way:

```jsx
import React from 'react';
import Auth from 'react-native-auth-manager';

export default class BasicExample extends React.Component {
 
    In process...

}
```