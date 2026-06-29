import type {
  NovaPoshtaSender,
  NovaPoshtaSettlement,
  NovaPoshtaStreet,
  NovaPoshtaWarehouse,
} from "@/features/integrations/model/integration.types";

import type {
  CityOption,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "./types";

function contactPersonName(
  contactPerson: NovaPoshtaSender["contactPersons"][number],
): string {
  const name = [
    contactPerson.lastName,
    contactPerson.firstName,
    contactPerson.middleName,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return name || contactPerson.description || contactPerson.person || "";
}

export function sendersToOptions(senders: NovaPoshtaSender[]): SenderOption[] {
  return senders.flatMap((sender) =>
    sender.contactPersons.map((contactPerson) => {
      const senderContactRef = contactPerson.ref;
      const senderName = sender.counterparty;
      const senderRef = sender.ref ?? senderContactRef;
      const senderPhone = contactPerson.phone ?? sender.phone ?? "";
      const label = `${sender.counterparty} - ${contactPersonName(
        contactPerson,
      )}`;

      return {
        value: senderContactRef,
        label,
        senderName,
        senderPhone,
        senderRef,
        senderContactRef,
      };
    }),
  );
}

export function settlementsToOptions(
  settlements: NovaPoshtaSettlement[],
): CityOption[] {
  return settlements.map((settlement) => ({
    value: settlement.cityRef ?? settlement.ref,
    label: settlement.description,
    cityName: settlement.description,
    settlementRef: settlement.ref,
  }));
}

export function warehousesToOptions(
  warehouses: NovaPoshtaWarehouse[],
): WarehouseOption[] {
  return warehouses.map((warehouse) => ({
    value: warehouse.ref,
    label: warehouse.description,
    warehouseName: warehouse.description,
  }));
}

export function streetsToOptions(streets: NovaPoshtaStreet[]): StreetOption[] {
  return streets.map((street) => ({
    value: street.ref,
    label: street.description,
    streetName: street.description,
  }));
}
