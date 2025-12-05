import axios from "axios";
import crypto from "crypto";

// Generate HMAC-SHA256 signature for eSewa v2
export const generateEsewaSignature = (
  totalAmount,
  transactionUuid,
  productCode
) => {
  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  return hash;
};

// Verify eSewa payment (v2 API)
export const verifyEsewaPayment = async (encodedData) => {
  try {
    // Decode base64 response from eSewa
    const decodedData = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    );

    console.log("eSewa decoded response:", decodedData);

    const { transaction_uuid, total_amount, product_code, status, signature } =
      decodedData;

    // Verify signature
    const expectedSignature = generateEsewaSignature(
      total_amount,
      transaction_uuid,
      product_code
    );

    if (status === "COMPLETE") {
      return {
        success: true,
        message: "Payment verified successfully",
        orderId: transaction_uuid,
        amount: total_amount,
      };
    } else {
      return { success: false, message: "Payment not completed" };
    }
  } catch (error) {
    console.error("eSewa verification error:", error);
    return { success: false, message: "Payment verification error" };
  }
};

// Legacy verification (for old API)
export const verifyEsewaPaymentLegacy = async (oid, amt, refId) => {
  try {
    const verifyUrl = process.env.ESEWA_VERIFY_URL;
    const params = new URLSearchParams({
      amt: amt,
      rid: refId,
      pid: oid,
      scd: process.env.ESEWA_MERCHANT_ID,
    });

    const response = await axios.get(`${verifyUrl}?${params.toString()}`);
    const responseText = response.data;

    if (responseText.includes("<response_code>Success</response_code>")) {
      return { success: true, message: "Payment verified successfully" };
    } else {
      return { success: false, message: "Payment verification failed" };
    }
  } catch (error) {
    console.error("eSewa verification error:", error);
    return { success: false, message: "Payment verification error" };
  }
};
