import {revalidatePath} from 'next/cache';
import {NextRequest} from 'next/server';
import {validateToken} from '../../../utils';

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    // Check for secret to confirm this is a valid request
    const token = params.get('token');
    const response = validateToken(token);
    if (response !== null) {
        return response;
    }

    const path = params.get('path');
    try {
        if (!path) {
            // This will revalidate everything
            revalidatePath('/', 'layout');
            console.info(`Revalidated everything`);
        } else {
            revalidatePath(normalizePath(path), 'page');
            console.info(`Revalidated [${path}]`);
        }
        return Response.json({revalidated: true}, {status: 200});
    } catch (err) {
        console.error(`Revalidation [${path ?? 'everything'}] error: ` + err);
        return Response.json({revalidated: false}, {status: 200});
    }
}

function normalizePath(path: string[] | string): string {
    let normalPath;
    if (typeof path === 'string') {
        normalPath = path.charAt(0) !== '/' ? '/' + path : path;
    } else {
        normalPath = '/' + path.join('/');
    }
    return normalPath;
}
