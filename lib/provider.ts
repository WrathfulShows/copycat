import { isProduction, paymentProvider } from "./config";
import { MockProvider } from "./payments-mock";
import { StripeProvider } from "./payments-stripe";
import { DojoProvider } from "./payments-dojo";
import type { PaymentProvider } from "./payments";

/** Select provider by PAYMENT_PROVIDER. Fail closed on missing env / mock in prod. */
export function getProvider(): PaymentProvider {
  const name = paymentProvider();
  if (name === "mock") {
    if (isProduction()) {
      throw new Error("Mock provider is disabled in production (503).");
    }
    return new MockProvider();
  }
  if (name === "stripe") return new StripeProvider();
  return new DojoProvider();
}
