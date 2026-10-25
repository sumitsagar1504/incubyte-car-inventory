import {Navigate,Route,Routes,useLocation} from 'react-router-dom';
import {useAuth} from './auth';
import Inventory from './pages/Inventory';
import VehicleDetail from './pages/VehicleDetail';
import {ReservationReview,ReservationDetail,ReservationsList} from './pages/Reservations';
import {Favorites,Compare} from './pages/SavedCars';
import {AuthPage,ForgotPassword,ResetPassword,VerifyEmail,Account} from './pages/Account';
import Admin from './pages/Admin';

function Protected({children,admin=false}:{children:React.ReactNode;admin?:boolean}){
  const {user}=useAuth();
  const location=useLocation();
  if(!user)return <Navigate to={`/login?next=${encodeURIComponent(location.pathname+location.search)}`} replace/>;
  if(admin && user.role!=='ADMIN')return <Navigate to="/" replace/>;
  return children;
}

export default function AppShell(){
  return <Routes>
    <Route path="/" element={<Inventory/>}/>
    <Route path="/vehicles/:id" element={<VehicleDetail/>}/>
    <Route path="/favorites" element={<Favorites/>}/>
    <Route path="/compare" element={<Compare/>}/>
    <Route path="/login" element={<AuthPage/>}/>
    <Route path="/register" element={<AuthPage register/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/reset-password" element={<ResetPassword/>}/>
    <Route path="/verify-email" element={<VerifyEmail/>}/>
    <Route path="/reserve/:id" element={<Protected><ReservationReview/></Protected>}/>
    <Route path="/reservations" element={<Protected><ReservationsList/></Protected>}/>
    <Route path="/reservations/:id" element={<Protected><ReservationDetail/></Protected>}/>
    <Route path="/account" element={<Protected><Account/></Protected>}/>
    <Route path="/admin" element={<Protected admin><Admin/></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
