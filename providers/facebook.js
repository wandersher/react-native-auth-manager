import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk';

export default class Facebook {
    static get providerId() { return "facebook.com" }
    static configure = () => LoginManager.setLoginBehavior('web_only')

    static async credentials() {
        const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
        if (result.isCancelled) throw { code: 'auth/canceled-by-user' }
        const data = await AccessToken.getCurrentAccessToken();
        if (data) {
            return auth.FacebookAuthProvider.credential(data.accessToken);
        } else {
            LoginManager.logOut();
            throw { code: 'auth/facebook-auth-not-enabled' };
        }
    }

    static async login() {
        const { user, additionalUserInfo } = await auth().signInWithCredential(await Facebook.credentials());
        return ({
            user: user,
            firstname: additionalUserInfo?.profile?.name.split(' ')[0],
            lastname: additionalUserInfo?.profile?.name.split(' ').length > 0 ? additionalUserInfo?.profile?.name.split(' ')[1] : "",
            id: additionalUserInfo?.profile?.id,
            provider: 'facebook',
            avatar: "http://graph.facebook.com/" + additionalUserInfo?.profile?.id + "/picture?type=square&width=256",
            email: additionalUserInfo?.profile?.email,
            token: await user.getIdToken()
        })
    }


    static async logout() {
        return await LoginManager.logOut();
    }

}
