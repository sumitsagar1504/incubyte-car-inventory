import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router-dom';
import {CarFront} from 'lucide-react';
import {authApi} from '../api';
import {useAuth} from '../auth';
import {Header,Footer} from '../components/Chrome';

function safeNext(value:string|null){return value?.startsWith('/')&&!value.startsWith('//')?value:'/'}

export function AuthPage({register=false}:{register?:boolean}){
  const {login}=useAuth();
  const navigate=useNavigate();
  const [params]=useSearchParams();
  const location=useLocation();
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){
    event.preventDefault();setError('');setBusy(true);
    try{
      if(register){await authApi.register({name,email,password});navigate(`/login?registered=1${params.get('next')?`&next=${encodeURIComponent(safeNext(params.get('next')))}`:''}`)}
      else{const result=await authApi.login({email,password});login(result.token,result.user);navigate(safeNext(params.get('next')))}
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }
  const other=register?'/login':'/register';
  return <div className="auth-shell"><div className="auth-art"><Link className="brand light" to="/"><CarFront size={26}/> ATELIER <span>MOTORS</span></Link><div><p className="eyebrow light">THE COLLECTION AWAITS</p><h1>Find your next<br/><em>remarkable</em> drive.</h1><p>Thoughtfully selected vehicles. Effortlessly yours.</p></div></div><main className="auth-panel"><div className="auth-inner"><Link className="back-link" to="/">← Browse without signing in</Link><p className="eyebrow">WELCOME TO ATELIER</p><h2>{register?'Create your account':'Welcome back'}</h2><p className="muted">{register?'Join us to reserve and save your next vehicle.':'Sign in to manage your reservations.'}</p>{!register&&params.has('registered')&&<p className="notice success" role="status">Account created. Please sign in.</p>}
    <form onSubmit={submit} className="form-stack">{register&&<label>Full name<input value={name} onChange={event=>setName(event.target.value)} autoComplete="name" minLength={2} maxLength={100} required/></label>}<label>Email address<input value={email} onChange={event=>setEmail(event.target.value)} type="email" autoComplete="email" required/></label><label>Password<input value={password} onChange={event=>setPassword(event.target.value)} type="password" autoComplete={register?'new-password':'current-password'} minLength={8} maxLength={128} required/></label>{error&&<p className="notice error" role="alert">{error} {error.startsWith('Email already')&&<Link to="/forgot-password">Reset password</Link>}</p>}<button className="btn primary full" disabled={busy}>{busy?'Please wait…':register?'Create account':'Sign in'}</button></form>
    {!register&&<p className="switch"><Link to="/forgot-password">Forgot your password?</Link></p>}<p className="switch">{register?'Already have an account?':'New to Atelier?'} <Link to={`${other}${location.search.includes('next=')?`?next=${encodeURIComponent(safeNext(params.get('next')))}`:''}`}>{register?'Sign in':'Create an account'}</Link></p></div></main></div>;
}

export function ForgotPassword(){
  const [email,setEmail]=useState('');
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{authApi.capabilities().then(result=>setEnabled(result.emailEnabled)).catch(()=>setEnabled(false))},[]);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');try{const result=await authApi.requestReset(email);setMessage(result.message)}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
  return <><Header/><main className="container narrow-page"><Link className="back-link" to="/login">← Back to sign in</Link><h1>Reset your password</h1>{enabled===false?<p className="notice">Email recovery is not available yet. The site owner needs to configure an email sender.</p>:<><p>Enter your account email and we’ll send a link if an account exists.</p><form className="form-stack" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={event=>setEmail(event.target.value)} required autoComplete="email"/></label><button className="btn primary" disabled={busy||enabled===null}>{busy?'Sending…':'Send reset link'}</button></form></>}{message&&<p className="notice success" role="status">{message}</p>}{error&&<p className="notice error" role="alert">{error}</p>}</main><Footer/></>;
}

export function ResetPassword(){
  const [params]=useSearchParams();
  const token=params.get('token')??'';
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();if(password!==confirm){setError('Passwords do not match');return}setBusy(true);setError('');try{const result=await authApi.confirmReset(token,password);setMessage(result.message)}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
  return <><Header/><main className="container narrow-page"><h1>Choose a new password</h1>{!token?<p className="notice error" role="alert">Reset link is missing.</p>:message?<p className="notice success" role="status">{message} <Link to="/login">Sign in</Link></p>:<form className="form-stack" onSubmit={submit}><label>New password<input type="password" value={password} onChange={event=>setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required/></label><label>Confirm new password<input type="password" value={confirm} onChange={event=>setConfirm(event.target.value)} autoComplete="new-password" required/></label><button className="btn primary" disabled={busy}>{busy?'Updating…':'Update password'}</button></form>}{error&&<p className="notice error" role="alert">{error}</p>}</main><Footer/></>;
}

export function VerifyEmail(){
  const [params]=useSearchParams();
  const token=params.get('token')??'';
  const started=useRef(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{if(!token||started.current)return;started.current=true;authApi.confirmVerification(token).then(result=>setMessage(result.message)).catch(cause=>setError((cause as Error).message))},[token]);
  return <><Header/><main className="container narrow-page"><h1>Verify your email</h1>{!token?<p className="notice error" role="alert">Verification link is missing.</p>:!message&&!error?<p>Checking your verification link…</p>:null}{message&&<p className="notice success" role="status">{message} <Link to="/account">Return to account</Link></p>}{error&&<p className="notice error" role="alert">{error}</p>}</main><Footer/></>;
}

export function Account(){
  const {user,login}=useAuth();
  const [enabled,setEnabled]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{authApi.capabilities().then(result=>setEnabled(result.emailEnabled)).catch(()=>{});authApi.me().then(result=>{const token=localStorage.getItem('token');if(token)login(token,result.user)}).catch(()=>{})},[]);
  async function sendVerification(){setError('');try{const result=await authApi.requestVerification();setMessage(result.message)}catch(cause){setError((cause as Error).message)}}
  return <><Header/><main className="container narrow-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Account settings</h1><div className="detail-panel"><p><strong>Name:</strong> {user?.name}</p><p><strong>Email:</strong> {user?.email}</p><p><strong>Role:</strong> {user?.role==='ADMIN'?'Administrator':'Customer'}</p><p><strong>Email status:</strong> {user?.emailVerified?'Verified':'Not verified'}</p>{!user?.emailVerified&&enabled&&<button className="btn outline" onClick={sendVerification}>Send verification email</button>}{!enabled&&<p className="muted">Email verification and password recovery will be available after the email sender is configured.</p>}<p><Link to="/forgot-password">Password recovery</Link></p></div>{message&&<p className="notice success" role="status">{message}</p>}{error&&<p className="notice error" role="alert">{error}</p>}</main><Footer/></>;
}
