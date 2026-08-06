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
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on page load/reload
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await api.get("/api/me");
        dispatch(setUser(data));
      } catch (error) {
        console.log("Auth session check error:", error);
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

      const response = await api.post("/api/auth/login", { token });
      dispatch(setUser(response.data));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0d0f14] text-white flex items-center justify-center font-medium">
        Loading ElysiumAI...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      {/* Sidebar with mobile state */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Pass mobile toggle handler into ChatArea */}
      <ChatArea onOpenMobileSidebar={() => setMobileOpen(true)} />

      <Artifact />

      {/* Login Modal */}
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-85 bg-[#13151c] border border-white/10 rounded-2xl p-7 flex flex-col gap-5 shadow-2xl">
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
