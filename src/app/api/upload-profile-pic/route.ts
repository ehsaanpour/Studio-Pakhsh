'use server';

import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('profilePic') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    
    // Use Liara disk mount point
    const uploadDir = path.join('/app/data', 'uploads', 'profile-pics');
    const filePath = path.join(uploadDir, filename);

    // Ensure the directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
      // Continue anyway as the directory might already exist
    }

    await writeFile(filePath, buffer);

    // Return the relative path that can be used to access the file
    const publicPath = `/data/uploads/profile-pics/${filename}`;
    return NextResponse.json({ url: publicPath }, { status: 200 });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ message: 'Failed to upload profile picture' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    // Convert the public URL to the actual file path
    const filePath = path.join('/app/data', url.replace('/data/', ''));
    await unlink(filePath);

    return NextResponse.json({ message: 'Profile picture deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json({ message: 'Failed to delete profile picture' }, { status: 500 });
  }
}
