// Response Formatter Utility
// Standardizes API responses across all endpoints

class ResponseFormatter {
  static success(data, message = null) {
    return {
      success: true,
      ...(message && { message }),
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(error, statusCode = 500) {
    return {
      success: false,
      error: error.message || error,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFormatter;
