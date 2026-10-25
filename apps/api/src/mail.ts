import { emailEnabled, env } from './config/env.js';

export async function sendAccountEmail(to:string,subject:string,text:string):Promise<void> {
  if (!emailEnabled) throw new Error('Email service is not configured');
  const response = await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({from:env.EMAIL_FROM,to:[to],subject,text})
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}
