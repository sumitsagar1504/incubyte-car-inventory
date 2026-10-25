import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {useAuth} from './auth';

type Saved={favorites:string[];compare:string[]};
type SavedContextValue=Saved&{
  toggleFavorite:(id:string)=>void;
  toggleCompare:(id:string)=>boolean;
  clearCompare:()=>void;
};
const Context=createContext<SavedContextValue|null>(null);
const empty:Saved={favorites:[],compare:[]};

function read(key:string):Saved{
  try {
    const data=JSON.parse(localStorage.getItem(key)||'null');
    return {favorites:Array.isArray(data?.favorites)?data.favorites:[],compare:Array.isArray(data?.compare)?data.compare:[]};
  } catch { return empty; }
}

export function SavedCarsProvider({children}:{children:ReactNode}){
  const {user}=useAuth();
  const key=`saved-cars:${user?.id??'guest'}`;
  const [saved,setSaved]=useState<Saved>(()=>read(key));
  useEffect(()=>setSaved(read(key)),[key]);
  function save(next:Saved){localStorage.setItem(key,JSON.stringify(next));setSaved(next)}
  function toggleFavorite(id:string){save({...saved,favorites:saved.favorites.includes(id)?saved.favorites.filter(value=>value!==id):[...saved.favorites,id]})}
  function toggleCompare(id:string){
    if(saved.compare.includes(id)){save({...saved,compare:saved.compare.filter(value=>value!==id)});return true}
    if(saved.compare.length>=3)return false;
    save({...saved,compare:[...saved.compare,id]});return true;
  }
  function clearCompare(){save({...saved,compare:[]})}
  return <Context.Provider value={{...saved,toggleFavorite,toggleCompare,clearCompare}}>{children}</Context.Provider>;
}
export function useSavedCars(){const value=useContext(Context);if(!value)throw new Error('SavedCarsProvider missing');return value}
