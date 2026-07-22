import { useEffect } from "react";
import { useDispatch } from "react-redux";
import getCurrentUser from "./features/getCurrentUser";
import Home from "./pages/Home";
import { setUser } from "./redux/userSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser();
      dispatch(setUser(data));
    };

    getUser();
  }, []);
  return (
    <>
      <Home />
    </>
  );
}
export default App;
