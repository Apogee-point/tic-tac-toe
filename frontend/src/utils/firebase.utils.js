// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDCuERAOIdoprb-tGaoaF4gBGsvvI9T9DA",
  authDomain: "auction-ac6ca.firebaseapp.com",
  databaseURL: "https://auction-ac6ca-default-rtdb.firebaseio.com",
  projectId: "auction-ac6ca",
  storageBucket: "auction-ac6ca.appspot.com",
  messagingSenderId: "119876906482",
  appId: "1:119876906482:web:8bb5027344d50c0c47cf6b",
  measurementId: "G-J2QE686B86"
};

// Initialize Firebase
// eslint-disable-next-line no-unused-vars
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

provider.getCustomParameters({
    prompt: 'select_account'
});
export const auth = getAuth(app);

export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      const user = result.user;

      localStorage.setItem("name", user.displayName);
      localStorage.setItem("email", user.email);
      localStorage.setItem("profilePic", user.photoURL);
      return user;

  } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential_1 = GoogleAuthProvider.credentialFromError(error);
      console.log(errorCode, errorMessage, email, credential_1);
      throw error; // Throw the error so it can be caught and handled in the parent component
  }
};
