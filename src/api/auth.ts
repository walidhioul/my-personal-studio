import api from "./axios";

export const getCsrf = () => api.get("/sanctum/csrf-cookie");

export const login = async (email: string, password: string) => {
  await getCsrf();
  return api.post("/login", { email, password });
};

export const register = async (name: string, email: string, password: string) => {
  await getCsrf();
  return api.post("/register", { name, email, password });
};

export const logout = () => api.post("/logout");

export const getUser = () => api.get("/api/user");

export const getFeedbacks = () => api.get("/feedbacks");
