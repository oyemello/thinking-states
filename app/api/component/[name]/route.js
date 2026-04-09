import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET(request, { params }) {
  try {
    const { name } = params;

    // Resolve the component file path
    const filePath = join(process.cwd(), 'app', 'components', `${name}.jsx`);

    // Read the file
    const code = await fs.readFile(filePath, 'utf-8');

    return Response.json({ code });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Component not found', message: error.message },
      { status: 404 }
    );
  }
}
