import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {CarFront,Heart,LogOut,Scale,ShieldCheck} from 'lucide-react';
import {useAuth} from '../auth';
import {useSavedCars} from '../saved';
import {vehicleImages,money} from '../media';
import type {Vehicle} from '../types';

export function Header(){
  const {user,logout}=useAuth();
  const {favorites,compare}=useSavedCars();
  const navigate=useNavigate();
  return <header className="site-header"><Link className="brand" to="/" aria-label="Atelier Motors home"><CarFront size={25}/> ATELIER <span>MOTORS</span></Link><nav aria-label="Main navigation">
    <Link to="/">Collection</Link>
    <Link to="/favorites">Favorites {favorites.length>0&&<span className="nav-count">{favorites.length}</span>}</Link>
    <Link to="/compare">Compare {compare.length>0&&<span className="nav-count">{compare.length}</span>}</Link>
    {user?.role==='ADMIN'&&<Link to="/admin"><ShieldCheck size={14}/> Manage</Link>}
    {user?<><Link to="/reservations">My reservations</Link><Link to="/account">Account</Link><button className="icon-button" onClick={()=>{logout();navigate('/')}} aria-label="Sign out" title="Sign out"><LogOut size={19}/></button></>:<><Link to="/login">Sign in</Link><Link className="nav-join" to="/register">Create account</Link></>}
  </nav></header>;
}

export function Footer(){return <footer><div className="container"><span>ATELIER MOTORS</span><span>Curated for the journey.</span><a href="/photo-credits.html">Photo credits</a></div></footer>}

export function VehiclePhoto({vehicle,className=''}:{vehicle:Vehicle;className?:string}){
  const photo=vehicleImages(vehicle)[0];
  return <div className={`vehicle-image ${className}`}>{photo?<img src={photo} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy"/>:<div className="image-fallback" aria-label="No photo available"><CarFront size={58}/></div>}<span className="category-badge">{vehicle.category}</span></div>;
}

export function VehicleCard({vehicle}:{vehicle:Vehicle}){
  const {favorites,compare,toggleFavorite,toggleCompare}=useSavedCars();
  const [message,setMessage]=useState('');
  function compareClick(){if(!toggleCompare(vehicle.id))setMessage('Compare up to three vehicles at a time.');else setMessage('')}
  return <article className="vehicle-card"><VehiclePhoto vehicle={vehicle}/><div className="vehicle-body"><p className="card-make">{vehicle.make}</p><h3><Link to={`/vehicles/${vehicle.id}`}>{vehicle.model}</Link></h3><div className="vehicle-meta"><span>{vehicle.quantity>0?`${vehicle.quantity} in stock`:'Out of stock'}</span><strong>{money(vehicle.price)}</strong></div><div className="card-actions"><button type="button" className="small-action" aria-pressed={favorites.includes(vehicle.id)} onClick={()=>toggleFavorite(vehicle.id)}><Heart size={17}/>{favorites.includes(vehicle.id)?'Saved':'Save'}</button><button type="button" className="small-action" aria-pressed={compare.includes(vehicle.id)} onClick={compareClick}><Scale size={17}/>{compare.includes(vehicle.id)?'Comparing':'Compare'}</button></div>{message&&<p role="status" className="inline-note">{message}</p>}<Link className="btn outline full" to={`/vehicles/${vehicle.id}`}>View details</Link></div></article>;
}
