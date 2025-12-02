import axios from "axios";

export const verifyEsewaPayment = async (oid, amt, refId) => {
  try {
    const verifyUrl = process.env.ESEWA_VERIFY_URL;
    const params = new URLSearchParams({
      amt: amt,
      rid: refId,
      pid: oid,
      scd: process.env.ESEWA_MERCHANT_ID,
    });

    const response = await axios.get(`${verifyUrl}?${params.toString()}`);

    // eSewa returns XML response with success/failure
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
