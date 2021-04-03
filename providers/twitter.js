import auth from '@react-native-firebase/auth';
//const { RNTwitterSignIn } = NativeModules

export default class Twitter {
    static get providerId() { return "twitter.com" }
    static configure = (app, secret) => {/* RNTwitterSignIn.init("qWPj1TXbreMX1SsDvdiQTaF7Y", "4t0cRfGWXZvySIa5sS0M38AnT8a8B8hwcX2lZiaStSWStD4B4Z")*/ }

    static async credentials() {
        // const data = await RNTwitterSignIn.logIn();
        // if (data) {
        //     return auth.TwitterAuthProvider.credential(data.authToken, data.authTokenSecret);
        // } else {
        //     throw { code: 'auth/twitter-auth-not-enabled' };
        // }
    }

    static async login() {
        try {
            const { user, additionalUserInfo } = await auth().signInWithCredential(await Twitter.credentials());
            return ({
                user: user,
                firstname: additionalUserInfo?.profile?.given_name,
                lastname: additionalUserInfo?.profile?.family_name,
                id: additionalUserInfo?.profile?.id,
                provider: 'twitter',
                avatar: additionalUserInfo?.profile?.picture,
                email: additionalUserInfo?.profile?.email,
                token: await user.getIdToken()
            })
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }


    static async logout() {
        // return await RNTwitterSignIn.logOut();
    }
}
