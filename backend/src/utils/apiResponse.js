/**
 * Standardized API Response Helpers
 * सबै API responses एउटै format मा हुनुपर्छ
 */

export class ApiResponse {
  /**
   * Success response
   */
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Success response with pagination
   */
  static successWithPagination(
    res,
    data,
    pagination,
    message = "Success",
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error response
   */
  static error(res, message = "Error occurred", statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   */
  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Not found response
   */
  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unauthorized response
   */
  static unauthorized(res, message = "Unauthorized access") {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Forbidden response
   */
  static forbidden(res, message = "Access forbidden") {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Pagination helper
 */
export class PaginationHelper {
  /**
   * Parse pagination parameters from request
   */
  static parsePaginationParams(req, defaultLimit = 20, maxLimit = 100) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(req.query.limit) || defaultLimit)
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Create pagination metadata
   */
  static createPaginationMeta(page, limit, total) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  /**
   * Apply pagination to mongoose query
   */
  static async paginate(model, query = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      populate = null,
      select = null,
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    let queryBuilder = model.find(query);

    if (select) queryBuilder = queryBuilder.select(select);
    if (populate) queryBuilder = queryBuilder.populate(populate);
    if (sort) queryBuilder = queryBuilder.sort(sort);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      queryBuilder.skip(skip).limit(limit).lean(),
      model.countDocuments(query),
    ]);

    return {
      data,
      pagination: this.createPaginationMeta(page, limit, total),
    };
  }
}

export default { ApiResponse, PaginationHelper };
