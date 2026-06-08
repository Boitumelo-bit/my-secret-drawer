import { 
  auth, 
  googleProvider, 
  facebookProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut
} from '../firebase/firebaseConfig';


// ===============================
// Google Sign In (FIXED SAFETY)
// ===============================
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/firebase-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          provider: 'google'
        })
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return {
        success: false,
        message: 'Backend sync failed'
      };
    }

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;

  } catch (error) {
    console.error('Google sign in error:', error);

    return {
      success: false,
      message: error?.message || 'Google sign in failed'
    };
  }
};


// ===============================
// Facebook Sign In (FIXED SAFETY)
// ===============================
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const firebaseUser = result.user;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/firebase-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          provider: 'facebook'
        })
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return {
        success: false,
        message: 'Backend sync failed'
      };
    }

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;

  } catch (error) {
    console.error('Facebook sign in error:', error);

    // ✅ FIXED: Handle popup close separately (NOT a real error)
    if (error?.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        message: 'Login cancelled (popup closed)',
        cancelled: true
      };
    }

    return {
      success: false,
      message: error?.message || 'Facebook sign in failed'
    };
  }
};


// ===============================
// Forgot Password (UNCHANGED LOGIC)
// ===============================
export const forgotPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: 'Password reset email sent. Check your inbox.'
    };

  } catch (error) {
    console.error('Forgot password error:', error);

    let errorMessage = 'Failed to send reset email';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    }

    return {
      success: false,
      message: errorMessage
    };
  }
};


// ===============================
// Logout (UNCHANGED LOGIC)
// ===============================
export const logoutUser = async () => {
  try {
    await signOut(auth);

    return { success: true };

  } catch (error) {
    console.error('Logout error:', error);

    return { success: false };
  }
};


// ===============================
// EXPORT DEFAULT
// ===============================
export default {
  signInWithGoogle,
  signInWithFacebook,
  forgotPassword,
  logoutUser,
};