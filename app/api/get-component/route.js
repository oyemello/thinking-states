import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request) {
  try {
    const { componentName } = await request.json();

    if (!componentName) {
      return Response.json({ error: 'Component name required' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'app', 'components', `${componentName}.jsx`);
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
