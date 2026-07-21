import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import api from "../utils/axios";

function App() {
  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/auth/login", { token });
      console.log(data);
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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <button className=" bg-amber-400" onClick={googleLogin}>
        continue with google
      </button>
    </div>
  );
}
export default App;
