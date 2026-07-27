import api from "../../utils/axios";

export default async function sendMessage(payload) {
  try {
    const { data } = await api.post("/api/agent/chat", payload);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
