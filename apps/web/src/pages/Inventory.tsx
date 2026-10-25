import {useEffect,useMemo,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Search,SlidersHorizontal,X} from 'lucide-react';
import {vehicleApi} from '../api';
import {useAuth} from '../auth';
import {Header,Footer,VehicleCard} from '../components/Chrome';
import type {VehiclePage} from '../types';

const labels:Record<string,string>={make:'Make',model:'Model',category:'Category',minPrice:'Min price',maxPrice:'Max price',inStock:'In stock'};
export default function Inventory(){
  const {user}=useAuth();
  const [params,setParams]=useSearchParams();
  const [result,setResult]=useState<VehiclePage|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const query=params.toString();
  const active=useMemo(()=>Object.entries(labels).filter(([key])=>params.get(key)),[query]);
  function update(key:string,value:string){const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);if(key!=='page')next.delete('page');setParams(next)}
  useEffect(()=>{
    let active=true;
    const timer=setTimeout(async()=>{
      setLoading(true);setError('');
      try{const page=await vehicleApi.list(new URLSearchParams(query));if(active)setResult(page)}
      catch(cause){if(active)setError((cause as Error).message)}
      finally{if(active)setLoading(false)}
    },250);
    return()=>{active=false;clearTimeout(timer)};
  },[query]);
  return <><Header/><section className="hero"><div className="container"><p className="eyebrow light">EXCEPTIONAL VEHICLES, SELECTED FOR YOU</p><h1>Drive something<br/><em>extraordinary.</em></h1><p>A curated collection for the road ahead.</p><a href="#collection" className="hero-link">Explore collection →</a></div></section><main id="collection" className="container collection"><div className="section-heading"><div><p className="eyebrow">THE ATELIER COLLECTION</p><h2>Available inventory</h2></div><p aria-live="polite">{loading?'Finding vehicles…':`${result?.total??0} vehicles discovered`}</p></div>
    {!user&&<p className="guest-note">Browse freely. <Link to="/register">Create an account</Link> when you’re ready to reserve a vehicle.</p>}
    <button type="button" className="mobile-filter-toggle btn outline" aria-expanded={filtersOpen} aria-controls="inventory-filters" onClick={()=>setFiltersOpen(value=>!value)}><SlidersHorizontal size={17}/> Filters {active.length>0&&`(${active.length})`}</button>
    <div id="inventory-filters" className={`filter-panel ${filtersOpen?'open':''}`}><div className="filter-bar">
      <label className="search-field"><Search size={19}/><span className="sr-only">Search make</span><input aria-label="Search make" placeholder="Search by make" value={params.get('make')??''} onChange={event=>update('make',event.target.value)}/></label>
      <input aria-label="Model" placeholder="Model" value={params.get('model')??''} onChange={event=>update('model',event.target.value)}/>
      <input aria-label="Category" placeholder="Category" value={params.get('category')??''} onChange={event=>update('category',event.target.value)}/>
      <input aria-label="Minimum price" type="number" min="0" placeholder="Min price" value={params.get('minPrice')??''} onChange={event=>update('minPrice',event.target.value)}/>
      <input aria-label="Maximum price" type="number" min="0" placeholder="Max price" value={params.get('maxPrice')??''} onChange={event=>update('maxPrice',event.target.value)}/>
      <select aria-label="Sort vehicles" value={params.get('sort')??'newest'} onChange={event=>update('sort',event.target.value)}><option value="newest">Newest first</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option><option value="make">Make: A–Z</option></select>
    </div><label className="stock-filter"><input type="checkbox" checked={params.get('inStock')==='true'} onChange={event=>update('inStock',event.target.checked?'true':'')}/> In stock only</label></div>
    {active.length>0&&<div className="filter-chips" aria-label="Active filters">{active.map(([key])=><button type="button" key={key} onClick={()=>update(key,'')}>{labels[key]}: {key==='inStock'?'Yes':params.get(key)} <X size={13}/></button>)}<button type="button" className="clear-filters" onClick={()=>setParams(new URLSearchParams())}>Clear all</button></div>}
    {error&&<p className="notice error" role="alert">{error}</p>}
    {loading&&!result&&<div className="loading-grid" aria-label="Loading vehicles">{[1,2,3].map(item=><div key={item} className="loading-card"/>)}</div>}
    {!loading&&result?.items.length===0&&<p className="state">No vehicles match your filters. <button type="button" onClick={()=>setParams(new URLSearchParams())}>Clear filters</button></p>}
    <div className="vehicle-grid" aria-busy={loading}>{result?.items.map(vehicle=><VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div>
    {result&&result.total>result.limit&&<div className="pagination"><button disabled={result.page===1} onClick={()=>update('page',String(result.page-1))}>Previous</button><span>Page {result.page} of {Math.ceil(result.total/result.limit)}</span><button disabled={result.page*result.limit>=result.total} onClick={()=>update('page',String(result.page+1))}>Next</button></div>}
  </main><Footer/></>;
}
