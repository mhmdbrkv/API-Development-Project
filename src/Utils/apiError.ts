class ApiError extends Error {
  public statusCode: number;
  public status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Set the prototype explicitly, necessary for extending built-in classes like Error in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
