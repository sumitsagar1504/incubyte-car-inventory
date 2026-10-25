import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db.js';
import { emailEnabled, env } from '../../config/env.js';
import { sendAccountEmail } from '../../mail.js';
import { HttpError } from '../../utils/errors.js';

const email = z.string().trim().toLowerCase().pipe(z.email());
const password = z.string().min(8).max(128);
const credentials = z.object({email,password});
const registration = credentials.extend({name:z.string().trim().min(2).max(100)});
const tokenInput = z.object({token:z.string().min(40).max(128)});
const digest = (token:string) => createHash('sha256').update(token).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');
const webOrigin = env.FRONTEND_URL.split(',')[0].trim();
export const authRouter = Router();

function publicUser(user:{id:string;name:string;email:string;role:string;emailVerifiedAt?:Date|null}) {
  return {id:user.id,name:user.name,email:user.email,role:user.role,emailVerified:Boolean(user.emailVerifiedAt)};
}

async function sendVerification(user:{id:string;email:string}) {
  const token = newToken();
  await db.emailVerificationToken.create({data:{userId:user.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+24*60*60*1000)}});
  await sendAccountEmail(user.email,'Verify your Atelier Motors email',`Verify your email using this link: ${webOrigin}/verify-email?token=${encodeURIComponent(token)}\n\nThis link expires in 24 hours.`);
}

authRouter.get('/capabilities',(_req,res)=>res.json({emailEnabled}));

authRouter.post('/register',async(req,res)=>{
  const data=registration.parse(req.body);
  if(await db.user.findUnique({where:{email:data.email}})) throw new HttpError(409,'Email already registered. Try signing in or resetting your password.');
  const passwordHash=await bcrypt.hash(data.password,12);
  try {
    const user=await db.user.create({data:{name:data.name,email:data.email,passwordHash}});
    if(emailEnabled) void sendVerification(user).catch(error=>console.error('Verification email failed',error));
    res.status(201).json({user:publicUser(user)});
  } catch(error) {
    if((error as {code?:string}).code==='P2002') throw new HttpError(409,'Email already registered. Try signing in or resetting your password.');
    throw error;
  }
});

authRouter.post('/login',async(req,res)=>{
  const data=credentials.parse(req.body);
  const user=await db.user.findUnique({where:{email:data.email}});
  if(!user || !(await bcrypt.compare(data.password,user.passwordHash))) throw new HttpError(401,'Invalid credentials');
  const token=jwt.sign({sub:user.id,sv:user.sessionVersion},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']});
  res.json({token,user:publicUser(user)});
});

authRouter.post('/password-reset/request',async(req,res)=>{
  const data=z.object({email}).parse(req.body);
  if(!emailEnabled) throw new HttpError(503,'Password reset email is not configured yet');
  const user=await db.user.findUnique({where:{email:data.email}});
  if(user){
    const token=newToken();
    await db.passwordResetToken.create({data:{userId:user.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+30*60*1000)}});
    try {
      await sendAccountEmail(user.email,'Reset your Atelier Motors password',`Reset your password using this link: ${webOrigin}/reset-password?token=${encodeURIComponent(token)}\n\nThis link expires in 30 minutes.`);
    } catch(error) { console.error('Password reset email failed',error); }
  }
  res.json({message:'If an account exists, a reset link will be sent.'});
});

authRouter.post('/password-reset/confirm',async(req,res)=>{
  const data=tokenInput.extend({password}).parse(req.body);
  const reset=await db.passwordResetToken.findUnique({where:{tokenHash:digest(data.token)}});
  if(!reset || reset.usedAt || reset.expiresAt.getTime()<Date.now()) throw new HttpError(400,'Invalid or expired reset link');
  const passwordHash=await bcrypt.hash(data.password,12);
  await db.$transaction(async tx=>{
    const claimed=await tx.passwordResetToken.updateMany({where:{id:reset.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});
    if(!claimed.count) throw new HttpError(400,'Invalid or expired reset link');
    await tx.user.update({where:{id:reset.userId},data:{passwordHash,sessionVersion:{increment:1}}});
  });
  res.json({message:'Password updated. Please sign in.'});
});

authRouter.post('/verify/request',requireAuth,async(req:AuthRequest,res)=>{
  if(!emailEnabled) throw new HttpError(503,'Email verification is not configured yet');
  const user=await db.user.findUniqueOrThrow({where:{id:req.auth!.id}});
  if(!user.emailVerifiedAt) await sendVerification(user);
  res.json({message:'If verification is needed, an email has been sent.'});
});

authRouter.post('/verify/confirm',async(req,res)=>{
  const data=tokenInput.parse(req.body);
  const verification=await db.emailVerificationToken.findUnique({where:{tokenHash:digest(data.token)}});
  if(!verification || verification.usedAt || verification.expiresAt.getTime()<Date.now()) throw new HttpError(400,'Invalid or expired verification link');
  await db.$transaction(async tx=>{
    const claimed=await tx.emailVerificationToken.updateMany({where:{id:verification.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});
    if(!claimed.count) throw new HttpError(400,'Invalid or expired verification link');
    await tx.user.update({where:{id:verification.userId},data:{emailVerifiedAt:new Date()}});
  });
  res.json({message:'Email verified. You can return to the app.'});
});

authRouter.get('/me',requireAuth,async(req:AuthRequest,res)=>{
  const user=await db.user.findUniqueOrThrow({where:{id:req.auth!.id}});
  res.json({user:publicUser(user)});
});

export interface AuthRequest extends Request { auth?: {id:string;role:'USER'|'ADMIN';emailVerified:boolean} }
export async function requireAuth(req:AuthRequest,_res:Response,next:NextFunction) {
  try {
    const raw=req.headers.authorization;
    if(!raw?.startsWith('Bearer ')) throw new HttpError(401,'Authentication required');
    let payload:jwt.JwtPayload;
    try { payload=jwt.verify(raw.slice(7),env.JWT_SECRET) as jwt.JwtPayload; }
    catch { throw new HttpError(401,'Invalid or expired token'); }
    const user=await db.user.findUnique({where:{id:String(payload.sub)}});
    if(!user || Number(payload.sv ?? 0)!==user.sessionVersion) throw new HttpError(401,'Invalid or expired token');
    req.auth={id:user.id,role:user.role,emailVerified:Boolean(user.emailVerifiedAt)};
    next();
  } catch(error) { next(error); }
}
export function requireAdmin(req:AuthRequest,_res:Response,next:NextFunction) {
  if(req.auth?.role!=='ADMIN') return next(new HttpError(403,'Admin access required'));
  next();
}
