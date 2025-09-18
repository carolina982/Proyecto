import React, { createContext, ReactNode, useContext, useState } from "react";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: "Admin" | "Chofer";
  photoUrl?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (email: string) => {
    // Aquí deberías buscar al usuario en tu store o backend
    const storedUser = { id: "1", nombre: "Juan", email, rol: "Admin" } as User;
    setCurrentUser(storedUser);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};