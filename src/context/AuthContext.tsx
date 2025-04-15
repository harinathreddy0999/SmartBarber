import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "../services/apiService";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  migrateLocalData: () => Promise<void>;
  dataMigrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataMigrated, setDataMigrated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        try {
          // Validate the token with the backend
          const response = await authApi.getProfile();

          if (response.data) {
            setUser({
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              avatar: response.data.avatar,
            });

            // Check if data has been migrated
            const migrationStatus = localStorage.getItem("dataMigrated");
            setDataMigrated(migrationStatus === "true");
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("authToken");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("authToken");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const { user: userData, token } = response.data;

        // Save token to localStorage
        localStorage.setItem("authToken", token);

        // Set user data
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
        });

        // Check if data has been migrated
        const migrationStatus = localStorage.getItem("dataMigrated");
        setDataMigrated(migrationStatus === "true");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authApi.register(name, email, password);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const { user: userData, token } = response.data;

        // Save token to localStorage
        localStorage.setItem("authToken", token);

        // Set user data
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
        });

        // New user, no need to migrate data
        setDataMigrated(true);
        localStorage.setItem("dataMigrated", "true");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  // Function to migrate data from localStorage to the database
  const migrateLocalData = async () => {
    if (!user || dataMigrated) return;

    setIsLoading(true);

    try {
      // Get data from localStorage
      const bookingsStr = localStorage.getItem("bookings");
      const savedStylesStr = localStorage.getItem("savedStyles");

      const bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
      const savedStyles = savedStylesStr ? JSON.parse(savedStylesStr) : [];

      // Send data to backend for migration
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/auth/migrate-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ bookings, savedStyles }),
        },
      );

      if (response.ok) {
        // Mark data as migrated
        localStorage.setItem("dataMigrated", "true");
        setDataMigrated(true);
        console.log("Data migration successful");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Migration failed");
      }
    } catch (error) {
      console.error("Data migration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        migrateLocalData,
        dataMigrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
