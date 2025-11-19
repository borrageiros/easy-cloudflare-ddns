import type { Handle } from '@sveltejs/kit';
import { initializeInterval } from '$lib/utils/interval';

// Status
import './routes/api/status/+server';
import './routes/api/interval/toggle/+server';
import './routes/api/interval/force/+server';
import './routes/api/interval/force-update/+server';

// Auth
import './routes/api/login/+server';
import './routes/api/validate-token/+server';
import './routes/api/generate-token/+server';

// Config
import './routes/api/config/+server';
import './routes/api/config/create/+server';
import './routes/api/config/update/+server';

// Interval

// Cloudflare
import './routes/api/cloudflare/records/+server';
import './routes/api/cloudflare/verify-credentials/+server';
import './routes/api/cloudflare/zones/+server';

// Zones
import './routes/api/zones/get/+server';
import './routes/api/zones/create/+server';
import './routes/api/zones/[id]/delete/+server';

// Records
import './routes/api/records/get/+server';
import './routes/api/records/create/+server';
import './routes/api/records/[id]/update/+server';
import './routes/api/records/[id]/delete/+server';

// Docs
import './routes/api/docs/swagger.json/+server';


console.log('Server starting - initializing interval...');
initializeInterval().then(({ intervalSeconds }) => {
  console.log(`Scheduled interval initialized with ${intervalSeconds} seconds`);
}).catch(error => {
  console.error('Failed to initialize interval:', error);
});

export const handle: Handle = async ({ event, resolve }) => {
  return await resolve(event);
}; 