import React, { createContext, ReactNode, useContext, useState } from "react";
export type Role = "admin" | "Chofer" ;

export interface User {
    id :string ;
    nombre: string ;
    email: string ;
    rol: Role ;
    photoUrl? :string | null ;

}

interface AuthContextType {
    currentUser : User | null ;
    login :(user:User ) => void;
    logout : () =>void;
}

const AuthContext = createContext<AuthContextType |undefined >(undefined);

export function AuthProvider ({children }: {children: ReactNode}){
    const [currentUser , setCurrentUser] =useState<User  |null >( null);
    const login =(user:User ) =>{
        setCurrentUser(user);
    };
    const logout =() => {
        setCurrentUser(null);
    };
    return(
        <AuthContext.Provider value ={{currentUser , login ,logout}}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth (){
    const context =useContext (AuthContext);
    if (!context) {
        throw new Error ("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}