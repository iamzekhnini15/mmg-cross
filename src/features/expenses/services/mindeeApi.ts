import { DEFAULT_VAT_RATE } from '@/lib/constants';
import type {
  InvoiceScanResult,
  MindeeEnqueueResponse,
  MindeeJobResponse,
  MindeeResultResponse,
} from '../types/invoiceScan';

const MINDEE_BASE_URL = 'https://api-v2.mindee.net';
const ENQUEUE_URL = `${MINDEE_BASE_URL}/v2/products/extraction/enqueue`;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // 60 seconds max

function getApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_MINDEE_API_KEY?.trim();
  if (!apiKey) throw new Error('EXPO_PUBLIC_MINDEE_API_KEY non configurée');
  return apiKey;
}

function getModelId(): string {
  const modelId = process.env.EXPO_PUBLIC_MINDEE_MODEL_ID?.trim();
  if (!modelId) throw new Error('EXPO_PUBLIC_MINDEE_MODEL_ID non configuré');
  return modelId;
}

function authHeaders(): Record<string, string> {
  return { Authorization: getApiKey() };
}

export async function scanInvoice(imageUri: string): Promise<InvoiceScanResult> {
  // 1. Enqueue the document
  const jobId = await enqueueDocument(imageUri);

  // 2. Poll until processed and get results directly
  const result = await pollAndGetResults(jobId);

  return mapResultToFormData(result);
}

async function enqueueDocument(imageUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('model_id', getModelId());

  const filename = imageUri.split('/').pop() ?? 'invoice.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : 'jpg';
  const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  if (typeof document !== 'undefined') {
    const blobResponse = await fetch(imageUri);
    const blob = await blobResponse.blob();
    formData.append('file', blob, filename);
  } else {
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);
  }

  const response = await fetch(ENQUEUE_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur Mindee enqueue (${response.status}): ${text}`);
  }

  const json: MindeeEnqueueResponse = await response.json();
  return json.job.id;
}

async function pollAndGetResults(jobId: string): Promise<MindeeResultResponse> {
  const pollUrl = `${MINDEE_BASE_URL}/v2/jobs/${jobId}`;

  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    // Let the browser follow redirects automatically (302 → results)
    const response = await fetch(pollUrl, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erreur Mindee (${response.status}): ${text}`);
    }

    // If the response was redirected, we got the results directly
    if (response.redirected || response.url.includes('/results/')) {
      return response.json();
    }

    // Otherwise, it's a job status response
    const json: MindeeJobResponse = await response.json();

    if (json.job.status === 'Failed') {
      throw new Error("Mindee n'a pas pu analyser le document");
    }

    // If job is processed but no redirect happened, fetch results manually
    if (json.job.status === 'Processed' && json.job.result_url) {
      const resultResponse = await fetch(json.job.result_url, {
        headers: authHeaders(),
      });
      if (!resultResponse.ok) {
        const text = await resultResponse.text();
        throw new Error(`Erreur Mindee résultats (${resultResponse.status}): ${text}`);
      }
      return resultResponse.json();
    }
  }

  throw new Error("Délai d'attente dépassé pour l'analyse Mindee");
}

function mapResultToFormData(result: MindeeResultResponse): InvoiceScanResult {
  const data = result.inference.result;
  const vatRate = data.taxes?.[0]?.rate ?? DEFAULT_VAT_RATE;

  let amountHT = data.total_net?.value ?? undefined;
  let amountTTC = data.total_amount?.value ?? undefined;

  if (amountTTC !== undefined && amountHT === undefined && vatRate > 0) {
    amountHT = Number((amountTTC / (1 + vatRate / 100)).toFixed(2));
  }
  if (amountHT !== undefined && amountTTC === undefined) {
    amountTTC = Number((amountHT * (1 + vatRate / 100)).toFixed(2));
  }

  return {
    provider: data.supplier_name?.value ?? undefined,
    invoice_ref: data.invoice_number?.value ?? undefined,
    expense_date: data.date?.value ?? undefined,
    amount_ht: amountHT,
    amount_ttc: amountTTC,
    vat_rate: vatRate,
  };
}
