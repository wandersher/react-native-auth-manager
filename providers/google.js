import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin'

export default class Google {
    static get providerId() { return "google.com" }
    static configure = (webClientId, iosClientId) => GoogleSignin.configure({ webClientId, iosClientId })
    static errors = Object.freeze({
        "IN_PROGRESS": statusCodes.IN_PROGRESS,
        "PLAY_SERVICES_NOT_AVAILABLE": statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
        "SIGN_IN_REQUIRED": statusCodes.SIGN_IN_REQUIRED,
        "SIGN_IN_CANCELLED": statusCodes.SIGN_IN_CANCELLED
    })

    static async credentials() {
        if (await GoogleSignin.hasPlayServices()) {
            const { idToken } = await GoogleSignin.signIn();
            const { accessToken } = await GoogleSignin.getTokens();
            return auth.GoogleAuthProvider.credential(idToken, accessToken);
        } else {
            throw { code: 'auth/google-services-not-enabled' };
        }
    }
    static async login() {
        const { user, additionalUserInfo } = await auth().signInWithCredential(await Google.credentials());
        return ({
            user: user,
            firstname: additionalUserInfo?.profile?.given_name,
            lastname: additionalUserInfo?.profile?.family_name,
            id: additionalUserInfo?.profile?.id,
            provider: 'google',
            avatar: additionalUserInfo?.profile?.picture,
            email: additionalUserInfo?.profile?.email,
            token: await user.getIdToken()
        })
    }

    static async logout() {
        return await GoogleSignin.signOut();
    }
}