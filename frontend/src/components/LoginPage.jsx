import { signInWithGoogle,auth } from "../utils/firebase.utils"
import { useState } from "react"

const LoginPage = () => {
    const [user, setUser] = useState(null);

    const handleSignIn = () => {
        signInWithGoogle()
          .then((userData) => {
            setUser(userData);
          })
          .catch((error) => {
            console.error('Error signing in with Google', error);
          });
    };

    return (
        <div>
          {!user ? <button className="login-with-google-btn" onClick={handleSignIn}>Sign in with Google</button> : <SignOutButton />}
          {user && <h4>Welcome, {user.displayName}!</h4>}
        </div>
      );
}

const SignOutButton = () => {
    const signOut = () => {
        auth.signOut()
          .then(() => {
            console.log('Signed Out');
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          })
    };
    return auth.currentUser && (
      <button className="login-with-google-btn" onClick={signOut}>Sign Out</button>
    );
}


export default LoginPage