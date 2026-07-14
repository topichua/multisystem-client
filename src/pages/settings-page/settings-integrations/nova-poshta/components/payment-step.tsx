import { DeliveryDefaultsFields } from "./delivery-defaults-fields";
import { ReservePackagingFields } from "./reserve-packaging-fields";

export function PaymentStep() {
  return (
    <>
      <DeliveryDefaultsFields />
      <ReservePackagingFields />
    </>
  );
}
