import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUser(data));
    } catch (error) {
      console.error(error);
    }
  };

  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider);
    const token = await data.user.getIdToken();
    await handleLogin(token);
  };
  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-85 bg-[#13151c] border border-white/8 rounded-2xl p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">Welcome to ElysiumAI_</h1>
              <p className="text-white/50 text-sm text-center">
                Sign in with Google to continue
              </p>
            </div>

            <button
              onClick={googleLogin}
              className="flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors duration-200 py-2 px-4 rounded-lg cursor-pointer"
            >
              <FcGoogle />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Home;
