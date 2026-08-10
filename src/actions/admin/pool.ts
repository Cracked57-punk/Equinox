'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';

export type ParsedQuestion = {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  imageLinks: string | null;
  isValid: boolean;
  errors: string[];
};

export type FetchPreviewResult =
  | { success: true; rows: ParsedQuestion[] }
  | { success: false; error: string };

function extractSheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function fetchSheetPreview(url: string): Promise<FetchPreviewResult> {
  await requireAdmin();

  try {
    let sheetId = url;
    if (url.includes('google.com/spreadsheets')) {
      const extracted = extractSheetId(url);
      if (!extracted) {
        return { success: false, error: 'Could not extract Sheet ID from URL.' };
      }
      sheetId = extracted;
    }

    if (!sheetId.trim()) {
       return { success: false, error: 'Sheet ID or URL cannot be empty.' };
    }

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(csvUrl, { cache: 'no-store' });

    if (!response.ok) {
      if (response.status === 404 || response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Sheet not found or not accessible. Ensure it is set to "Anyone with the link can view".',
        };
      }
      return { success: false, error: `Failed to fetch CSV: HTTP ${response.status}` };
    }

    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return { success: false, error: 'Failed to parse CSV format.' };
    }

    const rows: ParsedQuestion[] = parsed.data.map((row: any, index) => {
      const errors: string[] = [];

      // Flexible column name matching
      const text = row['Question text'] || row['Question'] || '';
      const optionA = row['Option A'] || row['A'] || '';
      const optionB = row['Option B'] || row['B'] || '';
      const optionC = row['Option C'] || row['C'] || '';
      const optionD = row['Option D'] || row['D'] || '';
      const rawAnswer = (row['Correct Answer'] || row['Answer'] || '').trim().toUpperCase();
      const imageLinks = row['Image Link'] || row['Image Links'] || row['Images'] || null;

      if (!text) errors.push('Missing question text');
      if (!optionA) errors.push('Missing Option A');
      if (!optionB) errors.push('Missing Option B');
      if (!optionC) errors.push('Missing Option C');
      if (!optionD) errors.push('Missing Option D');

      let correctAnswer = rawAnswer;
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        errors.push(`Invalid Correct Answer: "${rawAnswer}" (must be A, B, C, or D)`);
      }

      return {
        text,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        imageLinks,
        isValid: errors.length === 0,
        errors,
      };
    });

    return { success: true, rows };
  } catch (error: any) {
    console.error('Sheet fetch error:', error);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}

export async function commitQuestionPool(rows: ParsedQuestion[]) {
  await requireAdmin();

  const validRows = rows.filter((r) => r.isValid);
  if (validRows.length === 0) {
    return { success: false, error: 'No valid rows to commit.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Insert new questions (appending to the pool)
      await tx.question.createMany({
        data: validRows.map((r) => ({
          text: r.text,
          optionA: r.optionA,
          optionB: r.optionB,
          optionC: r.optionC,
          optionD: r.optionD,
          correctAnswer: r.correctAnswer,
          imageLinks: r.imageLinks,
          active: true,
        })),
      });
    });

    revalidatePath('/admin/pool');
    return { success: true };
  } catch (error: any) {
    console.error('Commit error:', error);
    return { success: false, error: 'Failed to save questions to database.' };
  }
}

export async function addQuestion(data: Omit<ParsedQuestion, 'isValid' | 'errors'>) {
  await requireAdmin();
  try {
    await prisma.question.create({
      data: {
        text: data.text,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        imageLinks: data.imageLinks || null,
        active: true,
      }
    });
    revalidatePath('/admin/pool');
    return { success: true };
  } catch (error: any) {
    console.error('Add question error:', error);
    return { success: false, error: 'Failed to add question.' };
  }
}

export async function updateQuestion(id: string, data: Omit<ParsedQuestion, 'isValid' | 'errors'>) {
  await requireAdmin();
  try {
    await prisma.question.update({
      where: { id },
      data: {
        text: data.text,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        imageLinks: data.imageLinks || null,
      }
    });
    revalidatePath('/admin/pool');
    return { success: true };
  } catch (error: any) {
    console.error('Update question error:', error);
    return { success: false, error: 'Failed to update question.' };
  }
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  try {
    // Soft delete to prevent breaking active/past exam sessions
    await prisma.question.update({
      where: { id },
      data: { active: false }
    });
    revalidatePath('/admin/pool');
    return { success: true };
  } catch (error: any) {
    console.error('Delete question error:', error);
    return { success: false, error: 'Failed to delete question.' };
  }
}
