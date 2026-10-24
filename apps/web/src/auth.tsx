import { createContext,useContext,useEffect,useState,type ReactNode } from 'react';
import type {User} from './types';
type Auth={user:User|null;login:(token:string,user:User)=>void;logout:()=>void};
const Context=createContext<Auth|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(()=>{try{return JSON.parse(localStorage.getItem('user')||'null')}catch{return null}});
  function logout(){localStorage.removeItem('token');localStorage.removeItem('user');setUser(null)}
  useEffect(()=>{window.addEventListener('auth-expired',logout);return()=>window.removeEventListener('auth-expired',logout)},[]);
  function login(token:string,next:User){localStorage.setItem('token',token);localStorage.setItem('user',JSON.stringify(next));setUser(next)}
  return <Context.Provider value={{user,login,logout}}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('AuthProvider missing');return value}
