import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (e) {
    return null;
  }
}

const roleModules: any = {
  admin: ['sales', 'sanction', 'disbursement', 'collection'],
  sales: ['sales'],
  sanction: ['sanction'],
  disbursement: ['disbursement'],
  collection: ['collection'],
  borrower: ['borrower']
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lms_token')?.value;
  const { pathname } = request.nextUrl;
  
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isBorrowerRoute = pathname.startsWith('/apply') || pathname.startsWith('/borrower');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isProtectedRoute = isBorrowerRoute || isDashboardRoute;

  if (pathname === '/') {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.role === 'borrower') return NextResponse.redirect(new URL('/borrower', request.url));
      if (decoded) return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute) {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.role === 'borrower') return NextResponse.redirect(new URL('/borrower', request.url));
      if (decoded) return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    const decoded = parseJwt(token);
    if (!decoded || Date.now() >= decoded.exp * 1000) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('lms_token');
      return response;
    }

    // Role-based access control
    if (decoded.role === 'borrower') {
      if (isDashboardRoute) return NextResponse.redirect(new URL('/borrower', request.url));
    } else {
      // Executive roles
      if (isBorrowerRoute) return NextResponse.redirect(new URL('/dashboard', request.url));
      
      // Module specific check
      if (isDashboardRoute && pathname !== '/dashboard') {
        const module = pathname.split('/')[2];
        if (module && !roleModules[decoded.role].includes(module)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
