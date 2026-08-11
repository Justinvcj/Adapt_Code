import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We can't access localStorage in Edge middleware, so we have to rely on 
  // client-side redirects for pure JWT localStorage setups, OR we can check 
  // cookies if we decide to store it there. Since the spec requires localStorage,
  // we will just do a lightweight check if they try to access protected routes,
  // but true protection happens in the AuthProvider on the client side.
  
  // However, we CAN intercept the request and let the client handle it.
  // Next.js middleware is best used with Cookies. Since we're using localStorage,
  // this middleware is mostly a pass-through. The actual redirecting will happen
  // in the layout/auth-context when localStorage is read.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/practice', '/dashboard', '/history'],
};
