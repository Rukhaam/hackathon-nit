class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  console.error("🚨 CRITICAL ERROR CAUGHT:", err);

  if (err.code === 'ER_DUP_ENTRY') {
    const message = "Duplicate field value entered. This record already exists.";
    const statusCode = 400;
    err = new ErrorHandler(message, statusCode);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = "Invalid reference: The linked record (User or Book) does not exist.";
    const statusCode = 400;
    err = new ErrorHandler(message, statusCode);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Json Web Token is invalid. Try again!";
    const statusCode = 400;
    err = new ErrorHandler(message, statusCode);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is expired. Try again!";
    const statusCode = 400;
    err = new ErrorHandler(message, statusCode);
  }

  const errorMessages = err.errors 
    ? Object.values(err.errors).map((e) => e.message).join(" ") 
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessages,
  });
};

export { ErrorHandler };