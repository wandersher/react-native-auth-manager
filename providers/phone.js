import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';



export default class Auth {
    static get providerId() { return "phone" }

    static state = null
    static action = null

    static async connect(number) {
        Auth.action = 'connect'
        Auth.state = await auth().verifyPhoneNumber(number)
        return true
    }

    static async login(number) {
        Auth.action = 'login'
        Auth.state = await auth().verifyPhoneNumber(number)
        return true
    }

    static async confirm(code) {
        if (!Auth.state) throw { code: 'auth/confirmation-code-error' }
        let credential = await auth.PhoneAuthProvider.credential(Auth.state.verificationId, code)
        if (Auth.action == 'connect') {
            let { user } = await auth().currentUser?.linkWithCredential(credential)
            return { user, provider: 'phone', token: await user.getIdToken() };
        } else {
            let { user } = await auth().signInWithCredential(credential)
            return { user, provider: 'phone', token: await user.getIdToken() };
        }
    }

}
