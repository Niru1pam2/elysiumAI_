import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { setUser } from "../redux/userSlice";
import { FcGoogle } from "react-icons/fc";

import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";

function Home() {
  // 1. FIX: Correctly extract the inner `user` property
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // 2. FIX: Check session on initial load/reload
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await api.get("/api/me");
        dispatch(setUser(data));
      } catch (error) {
        console.log(error);
        // If cookie is invalid or missing, clear Redux
        dispatch(setUser(null));
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // Handle Google Popup Login
  const googleLogin = async () => {
    try {
      const data = await signInWithPopup(auth, googleProvider);
      const token = await data.user.getIdToken();

      // Send token to gateway (sets HTTP-only cookie automatically)
      const response = await api.post("/api/auth/login", { token });
      dispatch(setUser(response.data));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(setUser(null));
    }
  };

  // Prevent UI flashing while checking session status
  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Loading ElysiumAI...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <ChatArea />
      <Artifact />

      {/* Login Modal */}
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-85 bg-[#13151c] border border-white/10 rounded-2xl p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold">Welcome to ElysiumAI_</h1>
              <p className="text-white/50 text-sm">
                Sign in with Google to continue
              </p>
            </div>

            <button
              onClick={googleLogin}
              className="flex items-center justify-center gap-2 bg-white text-black font-medium hover:bg-gray-200 transition-colors py-2.5 px-4 rounded-lg cursor-pointer"
            >
              <FcGoogle className="text-xl" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
