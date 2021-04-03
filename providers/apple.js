import auth from '@react-native-firebase/auth';
import appleAuth, { } from '@invertase/react-native-apple-authentication';

export default class Apple {
    static get providerId() { return "apple.com" }
    static configure = () => { }
    static get isSupported() { return appleAuth.isSupported }

    static async credentials() {
        const { identityToken, nonce } = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        if (identityToken) {
            return auth.AppleAuthProvider.credential(identityToken, nonce);
        } else {
            throw { code: 'auth/apple-auth-not-enabled' };
        }
    }

    static async login() {
        const { user, additionalUserInfo } = await auth().signInWithCredential(await Apple.credentials());
        return ({
            user: user,
            provider: 'apple',
            email: additionalUserInfo?.profile?.email,
            token: await user.getIdToken()
        })
    }

    static async logout() {
        return true
    }
}
