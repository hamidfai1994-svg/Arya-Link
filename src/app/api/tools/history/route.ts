import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ToolHistory } from '@/models/ToolHistory.model';
import { isValidUserSession } from '@/lib/db/data-isolation';

export const dynamic = 'force-dynamic';

// GET: Fetch saved tool history for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('toolType');
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));

    const query: any = { userId: session.user.id };
    if (toolType && (toolType === 'qr' || toolType === 'barcode')) {
      query.toolType = toolType;
    }

    const items = await ToolHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error('Failed to get tool history:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving tool history.' },
      { status: 500 }
    );
  }
}

// POST: Save a new generated QR code or barcode to history
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'Please log in to save to history.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { toolType, title, subtype, payload, previewDataUrl, config } = body;

    if (!toolType || !title || !payload) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: toolType, title, payload.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const record = await ToolHistory.create({
      userId: session.user.id,
      toolType: toolType === 'barcode' ? 'barcode' : 'qr',
      title: String(title).slice(0, 200),
      subtype: String(subtype || toolType),
      payload: String(payload),
      previewDataUrl: previewDataUrl ? String(previewDataUrl) : '',
      config: config || {},
    });

    return NextResponse.json({
      success: true,
      item: record,
      message: 'Saved to history successfully.',
    });
  } catch (error: any) {
    console.error('Failed to save tool history:', error);
    return NextResponse.json(
      { success: false, message: 'Server error saving tool history.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an item from history
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'History record ID is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await ToolHistory.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Record not found or not owned by user.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from history.',
    });
  } catch (error: any) {
    console.error('Failed to delete tool history item:', error);
    return NextResponse.json(
      { success: false, message: 'Server error deleting tool history item.' },
      { status: 500 }
    );
  }
}

