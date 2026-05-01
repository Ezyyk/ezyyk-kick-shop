import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    const filePath = path.join(process.cwd(), 'captured_code.txt');
    fs.writeFileSync(filePath, code);
    return new NextResponse(`Kód zachycen: ${code}. Můžeš zavřít toto okno a vrátit se do chatu.`);
  }
  return new NextResponse('Kód nenalezen v URL.');
}

export async function POST(req: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 });
}
