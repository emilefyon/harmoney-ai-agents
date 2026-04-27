const STATUS_BY_CODE = {
  INVALID_NAME: 400,
  VALIDATION_ERROR: 400,
  MISSING_API_KEY: 500,
  MALFORMED_PROMPT: 500,
  PERPLEXITY_TIMEOUT: 504,
  ENOENT: 404,
};

export function errorHandler(logger) {
  return (err, req, res, _next) => {
    let status = STATUS_BY_CODE[err.code] ?? null;
    if (status == null) {
      if (err.code === 'PERPLEXITY_ERROR') status = err.status || 502;
      else status = err.status || 500;
    }

    logger.error(
      { err, code: err.code, status, req_id: req.id, path: req.path },
      err.message
    );

    res
      .status(status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title: err.code || 'Internal Server Error',
        status,
        detail: err.message,
        request_id: req.id,
        ...(err.errors ? { errors: err.errors } : {}),
        ...(err.payload ? { upstream: err.payload } : {}),
      });
  };
}
