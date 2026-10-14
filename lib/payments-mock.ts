import { isProduction } from "./config";
import type { Order } from "./orders";
import type { HostedPayment, PaymentProvider } from "./payments";

/** Development/test-only provider. Always succeeds via a fake hosted page. */
export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createPayment(
    order: Order,
    opts: { successUrl: string; cancelUrl: string },
  ): Promise<HostedPayment> {
    if (isProduction()) {
      throw new Error("Mock provider is disabled in production (503).");
    }
    void opts;
    return {
      url: `/mock-pay/${order.id}`,
      providerRef: `mock_${order.id}`,
    };
  }
}
