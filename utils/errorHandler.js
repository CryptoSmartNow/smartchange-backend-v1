const handleError = (code, message, details) => {
  return {
    status: false,
    error: {
      message: message,
      code: code,
      details: details,
    },
  };
};

const internalServerError = (error) => {
  return {
    status: false,
    error: {
      message: "Internal Server Error",
      code: 500,
      details: "an Error Occured on the server Side",
      error_stack: error,
    },
  };
};

module.exports = { handleError, internalServerError };
