export type PartnerTabKey =
  | "managers"
  | "customers"
  | "subkons"
  | "bowheers"
  | "misc";

export type PartnerType =
  | "PROJECT MANAGER"
  | "ACCOUNT MANAGER"
  | "CUSTOMER"
  | "SUBKON"
  | "BOWHEER"
  | "MISC";

export type PartnerRecord = {
  id: string;
  name: string;
  type: PartnerType;
  email: string;
  phone: string;
  tab: PartnerTabKey;
};

export const PARTNER_STORAGE_KEY = "atlas-partners-v1";

export function nextPartnerId(records: PartnerRecord[]) {
  const maxN = records.reduce((acc, r) => {
    const n = Number(r.id.replace("MD-", ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `MD-${String(maxN + 1).padStart(4, "0")}`;
}

export function filterPartners(
  records: PartnerRecord[],
  tab: PartnerTabKey,
  type?: PartnerType,
) {
  let list = records.filter((r) => r.tab === tab);
  if (type) list = list.filter((r) => r.type === type);
  return list;
}
