import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api"; // Import the simple API instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    console.log("Registering with data:", userData);
    console.log("API URL:", process.env.REACT_APP_API_URL);
    console.log(
      "Full URL:",
      `${process.env.REACT_APP_API_URL}/api/auth/register`
    );

    try {
      const response = await api.post("/api/auth/register", userData);
      console.log("Registration response:", response);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out successfully");
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/api/users/profile", profileData);
      setUser(response.data.data);
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    isAdmin,
    updateProfile,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
