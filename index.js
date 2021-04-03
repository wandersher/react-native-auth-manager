import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

import Google from './providers/google'
import Facebook from './providers/facebook';
import Twitter from './providers/twitter';
import Apple from './providers/apple';
import Email from './providers/email';
import Phone from './providers/phone';


export default class Auth {

    static Email = Email
    static Phone = Phone
    static Google = Google
    static Facebook = Facebook
    static Twitter = Twitter
    static Apple = Apple


    static ErrorHandler = (code, response) => { console.log('Auth error: ', code); return response; }
    static setErrorHandler(callback) { Auth.ErrorHandler = callback }

    static onAuthStateChanged(callback) {
        return auth().onAuthStateChanged(callback)
    }

    static async isAuthorized() {
        return auth().currentUser ? await auth().currentUser?.getIdToken(true) : null
    }

    static isProviderAvailable(provider) {
        return auth().currentUser ? !!auth().currentUser?.providerData.find(it => it.providerId === provider) : false
    }

    // EMAIL AUTH ------------------------------------------

    static async email(email, password) {
        try {
            return Email.login(email, password)
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async changeEmail(email, password) {
        try {
            await Auth.reauth(password)
            return await Email.updateEmail(email)
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async changePassword(password, new_password) {
        try {
            await Auth.reauth(password)
            return await Email.updatePassword(new_password)
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async forgot(email) {
        try {
            return await Email.forgot(email);
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async signUp(email, password) {
        try {
            Email.signup(email, password)
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    // PHONE AUTH ------------------------------------------

    static async connectPhone(number) {
        try {
            return Phone.connect(number)
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async phone(number) {
        try {
            return Phone.login(number)
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async confirm(code) {
        try {
            return Phone.confirm(code)
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    // SOCIAL AUTH ------------------------------------------

    static async facebook() {
        try {
            return Facebook.login()
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async google() {
        try {
            return Google.login()
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async twitter() {
        try {
            return await Twitter.login()
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async apple() {
        try {
            return Apple.login()
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async connectSocial({ provider, email, password }) {
        try {
            if (auth().currentUser) {
                if (provider == 'email') await Auth.reauth(null)
                return {
                    status: await auth()?.currentUser?.linkWithCredential(await Auth.getCredentials({ provider, email, password })),
                    providers: Auth.getProviders()
                }
            } else {
                return false
            }
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }



    static async reauth({ password }) {
        try {
            return await Auth.getCredentials({ password }).then(credentials => auth().currentUser.reauthenticateWithCredential(credentials))
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async getCredentials({ provider = auth().currentUser?.providerId, phone = auth().currentUser.phoneNumber, email = auth().currentUser?.email, password }) {
        switch (provider) {
            case 'password':
                return await Email.credentials(email, password)
            case 'phone':
                return await auth().verifyPhoneNumber(phone).then(({ verificationId, code }) => auth.PhoneAuthProvider.credential(verificationId, code))
            case 'google.com':
                return await Google.credentials()
            case 'facebook.com':
                return await Facebook.credentials()
            case 'twitter.com':
                return await Twitter.credentials()
            case 'apple.com':
                return await Apple.credentials()
            default:
                return null
        }
    }

    static getProviders() {
        if (auth().currentUser) {
            return {
                email: auth()?.currentUser?.providerData.find(provider => provider.providerId === Email.providerId),
                phone: auth()?.currentUser?.providerData.find(provider => provider.providerId === Phone.providerId),
                google: auth()?.currentUser?.providerData.find(provider => provider.providerId === Google.providerId),
                facebook: auth()?.currentUser?.providerData.find(provider => provider.providerId === Facebook.providerId),
                twitter: auth()?.currentUser?.providerData.find(provider => provider.providerId === Twitter.providerId),
                apple: auth()?.currentUser?.providerData.find(provider => provider.providerId === Apple.providerId)
            }
        } else {
            return {}
        }
    }

    static getAvatar(path) {
        return auth()?.currentUser?.photoURL ? auth()?.currentUser?.photoURL : auth()?.currentUser?.providerData.find(provider => !!provider.photoURL)?.photoURL
    }

    static updateAvatar(path) {
        return storage().ref('avatars/' + auth()?.currentUser?.uid).putFile(path).then(({ ref }) => ref.getDownloadURL().then(photoURL => auth()?.currentUser?.updateProfile({ photoURL }).then(() => photoURL)))
    }

    static async signOut() {
        return await Promise.all([
            Email.logout(),
            Google.logout(),
            Facebook.logout(),
            Apple.logout(),
            Twitter.logout(),
        ])
    }

}
