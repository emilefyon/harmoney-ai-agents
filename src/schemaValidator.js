import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import { config } from './config.js';
import { logger } from './logger.js';

const SCHEMA_FILENAME = '_schema.json';

let validateFn = null;
let schemaId = null;
let initDone = false;

function init() {
  if (initDone) return;
  initDone = true;
  const schemaPath = path.join(config.PROMPTS_DIR, SCHEMA_FILENAME);
  if (!existsSync(schemaPath)) {
    logger.warn({ schemaPath }, 'envelope schema not found; output validation disabled');
    return;
  }
  try {
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
    schemaId = schema.$id || 'agent-envelope';
    const ajv = new Ajv({ allErrors: true, strict: false });
    validateFn = ajv.compile(schema);
    logger.info({ schemaId }, 'envelope schema loaded');
  } catch (err) {
    logger.error({ err, schemaPath }, 'failed to load envelope schema');
    validateFn = null;
  }
}

export function validateEnvelope(json) {
  init();
  if (!validateFn) return null;
  if (json == null || typeof json !== 'object') {
    return {
      valid: false,
      schema_id: schemaId,
      errors: [{ path: '/', message: 'no JSON envelope in result', keyword: 'type', params: {} }],
    };
  }
  const valid = validateFn(json);
  return {
    valid,
    schema_id: schemaId,
    errors: valid
      ? []
      : (validateFn.errors || []).slice(0, 50).map((e) => ({
          path: e.instancePath || '/',
          message: e.message,
          keyword: e.keyword,
          params: e.params,
        })),
  };
}
