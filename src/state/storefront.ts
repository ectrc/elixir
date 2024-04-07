import { StorefrontResponse, getStorefront } from "src/api/storefront";
import { create } from "zustand";

export interface StorefrontState {
  storefront: StorefrontResponse;
  fetch: () => Promise<void>;
  fetchedOnce: boolean;
}

interface Price {
  basePrice: number;
  currencySubType: string;
  currencyType: string;
  finalPrice: number;
  regularPrice: number;
  saleExpiration: string;
  saleType?: string;
}

interface Requirement {
  minQuantity: number;
  requiredId: string;
  requirementType: string;
}

interface GiftInfo {
  bIsEnabled: boolean;
  forcedGiftBoxTemplateId: string;
  giftRecordIds: string[];
  purchaseRequirements: Requirement[];
}

interface ItemGrant {
  quantity: number;
  templateId: string;
}

interface MetaInfo {
  key: string;
  value: string;
}

interface CatalogEntry {
  appStoreId: string[];
  catalogGroupPriority: number;
  categories: string[];
  dailyLimit: number;
  devName: string;
  displayAssetPath: string;
  filterWeight: number;
  fullfillmentIds: string[];
  giftInfo: GiftInfo;
  itemGrants: ItemGrant[];
  matchFilter: string;
  meta: Record<string, any>;
  metaInfo: MetaInfo[];
  monthlyLimit: number;
  offerId: string;
  offerType: string;
  prices: Price[];
  refundable: boolean;
  requirements: Requirement[];
  sortPriority: number;
  weeklyLimit: number;
}

export interface Storefront {
  name: string;
  catalogEntries: CatalogEntry[];
}

const useStorefront = create<StorefrontState>((set) => ({
  storefront: {
    dailyPurchaseHrs: 1,
    expiration: "",
    refreshIntervalHrs: "",
    storefronts: [],
  },
  fetchedOnce: false,
  fetch: async () => {
    const data = await getStorefront();
    if (!data.success) return set({ fetchedOnce: true });

    set({ storefront: data.data, fetchedOnce: true });
  },
}));

export default useStorefront;
