import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin'
import { LoginManager, AccessToken } from 'react-native-fbsdk';
//const { RNTwitterSignIn } = NativeModules
import appleAuth, { } from '@invertase/react-native-apple-authentication';

LoginManager.setLoginBehavior('web_only')


export default class Auth {

    static Providers = Object.freeze({ "Email": 'password', "Phone": 'phone', "Google": 'google', "Facebook": 'facebook', "Apple": 'apple', "Twitter": 'twitter' })

    static Google = {
        configure: (webClientId, iosClientId) => GoogleSignin.configure({ webClientId, iosClientId })
    }
    static Apple = {
        isSupported: appleAuth.isSupported
    }
    static Twitter = {
        configure: (app, secret) => {/* RNTwitterSignIn.init("qWPj1TXbreMX1SsDvdiQTaF7Y", "4t0cRfGWXZvySIa5sS0M38AnT8a8B8hwcX2lZiaStSWStD4B4Z")*/ }
    }

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

    static async getEmailCredential(email, password) {
        try {
            return await auth.EmailAuthProvider.credential(email, password)
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async email(email, password) {
        try {
            let userCredential = await auth().signInWithEmailAndPassword(email, password);
            let token = await Auth.isAuthorized()
            return ({ user: userCredential.user, email, provider: 'email', token });
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async changeEmail(email, password) {
        try {
            await Auth.reauth(password)
            await auth().currentUser?.updateEmail(email)
            return true
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async changePassword(password, new_password) {
        try {
            await Auth.reauth(password)
            await auth().currentUser?.updatePassword(new_password)
            return true
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }


    static async forgot(email) {
        try {
            return await auth().sendPasswordResetEmail(email);
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async signUp(email, password) {
        try {
            let userCredential = await auth().createUserWithEmailAndPassword(email, password);
            let token = await Auth.isAuthorized()
            return ({ user: userCredential.user, email, provider: 'email', token });
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static verificationId = ""
    static verificationAction = ""
    static async connectPhone(number) {
        try {
            var { verificationId } = await auth().verifyPhoneNumber(number)
            Auth.verificationId = verificationId
            Auth.verificationAction = 'connect'
            return true
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }


    static async phone(number) {
        try {
            var { verificationId, code } = await auth().verifyPhoneNumber(number)
            Auth.verificationId = verificationId
            Auth.verificationAction = 'login'
            return true
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async confirm(code) {
        try {
            let credential = await auth.PhoneAuthProvider.credential(Auth.verificationId, code)
            let result = { user: null }
            switch (Auth.verificationAction) {
                case 'login':
                    result = await auth().signInWithCredential(credential)
                    break
                case 'connect':
                    result = await auth().currentUser?.linkWithCredential(credential)
                    break
                default:
                    return { user: null }
            }
            let token = await Auth.isAuthorized()
            return { user: result.user, provider: 'phone', token };
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }




    static async getFacebookCredential() {
        try {
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
            if (result.isCancelled) {
                return Auth.ErrorHandler({ code: 'auth/canceled-by-user' }, null)
            }
            const data = await AccessToken.getCurrentAccessToken();
            if (!data) {
                LoginManager.logOut();
                return null
            }
            return auth.FacebookAuthProvider.credential(data.accessToken);
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async facebook() {
        try {
            const credential = await Auth.getFacebookCredential()
            if (credential) {
                const userCredential = await auth().signInWithCredential(credential);
                let token = await Auth.isAuthorized()
                return ({
                    user: userCredential.user,
                    firstname: userCredential?.additionalUserInfo?.profile?.name.split(' ')[0],
                    lastname: userCredential?.additionalUserInfo?.profile?.name.split(' ').length > 0 ? userCredential?.additionalUserInfo?.profile?.name.split(' ')[1] : "",
                    id: userCredential?.additionalUserInfo?.profile?.id,
                    provider: 'facebook',
                    avatar: "http://graph.facebook.com/" + userCredential?.additionalUserInfo?.profile?.id + "/picture?type=square&width=256",
                    email: userCredential?.additionalUserInfo?.profile?.email,
                    token
                })
            } else {
                return { user: null }
            }
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async getGoogleCredential() {
        try {
            if (await GoogleSignin.hasPlayServices()) {
                const { idToken } = await GoogleSignin.signIn();
                const { accessToken } = await GoogleSignin.getTokens();
                return auth.GoogleAuthProvider.credential(idToken, accessToken);
            } else {
                return null;
            }
        } catch (err) {
            return Auth.ErrorHandler(err, null);
        }
    }

    static async google() {
        try {
            const credentials = await Auth.getGoogleCredential()
            if (credentials) {
                const userCredential = await auth().signInWithCredential(credentials);
                return ({
                    user: userCredential.user,
                    firstname: userCredential?.additionalUserInfo?.profile?.given_name,
                    lastname: userCredential?.additionalUserInfo?.profile?.family_name,
                    id: userCredential?.additionalUserInfo?.profile?.id,
                    provider: 'google',
                    avatar: userCredential?.additionalUserInfo?.profile?.picture,
                    email: userCredential?.additionalUserInfo?.profile?.email,
                    token: await Auth.isAuthorized()
                })
            } else {
                return ({ user: null });
            }
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }


    static async getTwitterCredential() {
        try {
            // const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();
            // return auth.TwitterAuthProvider.credential(authToken, authTokenSecret);
            return ({ user: null });
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async twitter() {
        try {
            const userCredential = await auth().signInWithCredential(await Auth.getTwitterCredential());
            return ({
                user: userCredential.user,
                firstname: userCredential?.additionalUserInfo?.profile?.given_name,
                lastname: userCredential?.additionalUserInfo?.profile?.family_name,
                id: userCredential?.additionalUserInfo?.profile?.id,
                provider: 'twitter',
                avatar: userCredential?.additionalUserInfo?.profile?.picture,
                email: userCredential?.additionalUserInfo?.profile?.email,
                token: await Auth.isAuthorized()
            })
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }



    static AppleSuported = appleAuth.isSupported;
    static async getAppleCredential() {
        try {
            const { identityToken, nonce } = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });
            console.log(identityToken, nonce)
            if (identityToken) {
                return auth.AppleAuthProvider.credential(identityToken, nonce);
            } else {
                return null
            }
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static async apple() {
        try {
            const userCredential = await auth().signInWithCredential(await Auth.getAppleCredential());
            return ({
                user: userCredential.user,
                provider: 'apple',
                email: userCredential?.additionalUserInfo?.profile?.email,
                token: await Auth.isAuthorized()
            })
        } catch (err) {
            return Auth.ErrorHandler(err, { user: null })
        }
    }

    static async connectSocial(provider, email, password) {
        try {
            if (auth().currentUser) {
                let credential = null
                switch (provider) {
                    case 'email':
                        await Auth.reauth(null)
                        credential = await Auth.getEmailCredential(email, password)
                        break;
                    case 'google':
                        credential = await Auth.getGoogleCredential()
                        break;
                    case 'facebook':
                        credential = await Auth.getFacebookCredential()
                        break;
                    case 'twitter':
                        credential = await Auth.getTwitterCredential()
                        break;
                    case 'apple':
                        credential = await Auth.getAppleCredential()
                        break;
                    default:
                        return false
                }
                return {
                    status: credential ? await auth()?.currentUser?.linkWithCredential(credential) : false,
                    providers: Auth.getProviders()
                }
            } else {
                return false
            }
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }


    static async reauth(password) {
        try {
            let credential
            if (auth().currentUser) {
                let email = auth().currentUser?.email
                let phone = auth().currentUser?.phoneNumber
                switch (auth().currentUser?.providerId) {
                    case 'password':
                        if (email) {
                            credential = await Auth.getEmailCredential(email, password)
                        }
                        break;
                    case 'phone':
                        if (email && password) {
                            credential = await Auth.getEmailCredential(email, password)
                        } else {
                            if (phone) {
                                let { verificationId, code } = await auth().verifyPhoneNumber(phone)
                                if (code) {
                                    credential = auth.PhoneAuthProvider.credential(verificationId, code)
                                }
                            }
                        }
                        break;
                    case 'google':
                        credential = await Auth.getGoogleCredential()
                        break;
                    case 'facebook':
                        credential = await Auth.getFacebookCredential()
                        break;
                    case 'twitter':
                        credential = await Auth.getTwitterCredential()
                        break;
                    case 'apple':
                        credential = await Auth.getAppleCredential()
                        break;
                    default:
                        return false
                }
                return credential ? await auth()?.currentUser?.reauthenticateWithCredential(credential) : null
            }
        } catch (err) {
            return Auth.ErrorHandler(err, null)
        }
    }

    static getProviders() {
        if (auth().currentUser) {
            return {
                email: auth()?.currentUser?.providerData.find(provider => provider.providerId === 'password'),
                phone: auth()?.currentUser?.providerData.find(provider => provider.providerId === 'phone'),
                google: auth()?.currentUser?.providerData.find(provider => provider.providerId === 'google.com'),
                facebook: auth()?.currentUser?.providerData.find(provider => provider.providerId === 'facebook.com'),
                twitter: auth()?.currentUser?.providerData.find(provider => provider.providerId === 'twitter.com'),
                apple: auth()?.currentUser?.providerData.find(provider => provider.providerId === 'apple.com')
            }
        } else {
            return {}
        }
    }

    static getAvatar() {
        if (auth()?.currentUser?.photoURL) {
            return auth()?.currentUser?.photoURL
        } else {
            let provider = auth()?.currentUser?.providerData.find(provider => !!provider.photoURL)
            return provider ? provider.photoURL : null
        }
    }

    static updateAvatar(path) {
        return storage().ref('avatars/' + auth()?.currentUser?.uid).putFile(path).then(({ ref }) => ref.getDownloadURL().then(photoURL => auth()?.currentUser?.updateProfile({ photoURL })))
    }


    static async signOut() {
        return auth().signOut().then(async () => {
            await GoogleSignin.signOut();
            await LoginManager.logOut();
            // await RNTwitterSignIn.logOut()
            return true
        })
    }

}
