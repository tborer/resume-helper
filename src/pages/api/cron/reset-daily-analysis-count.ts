// pages/api/cron/reset-daily-analysis-count.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.userAccess.updateMany({
      data: {
        dailyAnalysisCount: 0,
      },
    });
    console.log('Daily analysis count reset successfully');
  } catch (error) {
    console.error('Error resetting daily analysis count:', error);
  }
  return NextResponse.json({ ok: true });
}