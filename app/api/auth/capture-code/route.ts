import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    const filePath = path.join(process.cwd(), 'captured_code.txt');
    fs.writeFileSync(filePath, code);
    return new NextResponse('Kod zachycen: ' + code);
  }
  return new NextResponse('Kod nenalezen v URL.');
}
