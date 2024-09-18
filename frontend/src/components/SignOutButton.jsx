import { auth } from './firebase.utils'; // Import your Firebase auth module

const SignOutButton = () => {
  const signOut = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out');
      })
      .catch((error) => {
        console.error('Error signing out', error);
      });
  };

  return (
    <button onClick={signOut}>Sign Out</button>
  );
};

export default SignOutButton;