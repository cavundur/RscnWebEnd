import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const token = process.env.REVALIDATE_TOKEN;
  const path = request.nextUrl.searchParams.get('path');
  const providedToken = request.nextUrl.searchParams.get('token');

  // Token kontrolü
  if (!token || providedToken !== token) {
    return NextResponse.json(
      { 
        revalidated: false, 
        message: 'Geçersiz token' 
      },
      { status: 401 }
    );
  }

  // Path kontrolü
  if (!path) {
    return NextResponse.json(
      { 
        revalidated: false, 
        message: 'Path parametresi eksik' 
      },
      { status: 400 }
    );
  }

  try {
    // Belirtilen yolu yeniden doğrula (revalidate)
    revalidatePath(path);
    
    return NextResponse.json(
      { 
        revalidated: true, 
        message: `${path} yolu yeniden doğrulandı`,
        now: Date.now()
      }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { 
        revalidated: false, 
        message: 'Revalidation sırasında hata oluştu'
      },
      { status: 500 }
    );
  }
} 