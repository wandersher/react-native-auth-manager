import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';


export default class Email {
    static get providerId() { return "password" }

    static async credentials(email, password) {
        return await auth.EmailAuthProvider.credential(email, password)
    }

    static async signup(email, password) {
        let { user } = await auth().createUserWithEmailAndPassword(email, password);
        return ({ user, email, provider: 'email', token: await user.getIdToken() });
    }

    static async login(email, password) {
        let { user } = await auth().signInWithEmailAndPassword(email, password);
        return ({ user, email, provider: 'email', token: await user.getIdToken() });
    }

    static async changeEmail(email) {
        await auth().currentUser?.updateEmail(email)
        return true
    }

    static async changePassword(password) {
        await auth().currentUser?.updatePassword(password)
        return true
    }

    static async forgot(email) {
        return await auth().sendPasswordResetEmail(email);
    }

    static async logout() {
        return true
    }

}
