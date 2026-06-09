export const CHART_PALETTE = [
  "#6e62cd",
  "#8D59DC",
  "#2DA68B",
  "#5795EE",
  "#D5318C",
  "#15A5DC",
  "#E67600",
  "#C932D8",
] as const;

export type AnalyticsCategoryKey =
  | "clothing"
  | "footwear"
  | "accessories"
  | "electronics"
  | "home";

export type AnalyticsOrderStatusKey =
  | "new"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type AnalyticsChannelKey = "instagram" | "telegram" | "viber" | "direct";

export type AnalyticsCharacteristicKey =
  | "size"
  | "color"
  | "material"
  | "brand"
  | "season"
  | "weight";

export type AnalyticsProductKey =
  | "linenDress"
  | "sneakersUrban"
  | "leatherBag"
  | "wirelessEarbuds"
  | "ceramicVase";

export const revenueTrend = {
  days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  orders: [42, 58, 51, 73, 89, 112, 96],
  revenue: [18400, 24600, 21300, 31200, 37800, 45100, 39200],
};

export const salesByCategory: Array<{
  key: AnalyticsCategoryKey;
  value: number;
}> = [
  { key: "clothing", value: 38420 },
  { key: "footwear", value: 22150 },
  { key: "accessories", value: 15880 },
  { key: "electronics", value: 12640 },
  { key: "home", value: 9340 },
];

export const topProducts: Array<{
  key: AnalyticsProductKey;
  sales: number;
}> = [
  { key: "linenDress", sales: 186 },
  { key: "sneakersUrban", sales: 154 },
  { key: "leatherBag", sales: 121 },
  { key: "wirelessEarbuds", sales: 98 },
  { key: "ceramicVase", sales: 76 },
];

export const ordersByStatus: Array<{
  key: AnalyticsOrderStatusKey;
  value: number;
}> = [
  { key: "new", value: 48 },
  { key: "processing", value: 63 },
  { key: "shipped", value: 41 },
  { key: "completed", value: 214 },
  { key: "cancelled", value: 12 },
];

export const conversationsByChannel: Array<{
  key: AnalyticsChannelKey;
  value: number;
}> = [
  { key: "instagram", value: 342 },
  { key: "telegram", value: 187 },
  { key: "viber", value: 96 },
  { key: "direct", value: 54 },
];

export const characteristicsCoverage: Array<{
  key: AnalyticsCharacteristicKey;
  filled: number;
  total: number;
}> = [
  { key: "size", filled: 92, total: 100 },
  { key: "color", filled: 88, total: 100 },
  { key: "material", filled: 74, total: 100 },
  { key: "brand", filled: 81, total: 100 },
  { key: "season", filled: 56, total: 100 },
  { key: "weight", filled: 48, total: 100 },
];

export const analyticsSummary = {
  totalRevenue: 198_640,
  totalOrders: 521,
  activeProducts: 248,
  conversionRate: 3.8,
};

export type AnalyticsFunnelKey =
  | "catalogViews"
  | "conversations"
  | "orders"
  | "paid";

export type AnalyticsMonthKey =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun";

export type AnalyticsStockCategoryKey =
  | "clothing"
  | "footwear"
  | "accessories"
  | "electronics";

export type AnalyticsWeekdayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type AnalyticsOrderSourceKey =
  | "instagramStory"
  | "instagramDm"
  | "catalogLink"
  | "telegramBot"
  | "manual";

export type AnalyticsTeamMemberKey = "olena" | "andrii" | "maria" | "dmytro";

export type AnalyticsHeatmapDayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export const salesFunnel: Array<{ key: AnalyticsFunnelKey; value: number }> = [
  { key: "catalogViews", value: 4820 },
  { key: "conversations", value: 1246 },
  { key: "orders", value: 521 },
  { key: "paid", value: 467 },
];

export const monthlyClients = {
  months: ["jan", "feb", "mar", "apr", "may", "jun"] as AnalyticsMonthKey[],
  newClients: [84, 96, 112, 108, 134, 147],
  returningClients: [156, 168, 174, 189, 201, 218],
};

export const stockHealthByCategory: Array<{
  key: AnalyticsStockCategoryKey;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}> = [
  { key: "clothing", inStock: 118, lowStock: 22, outOfStock: 6 },
  { key: "footwear", inStock: 64, lowStock: 14, outOfStock: 3 },
  { key: "accessories", inStock: 89, lowStock: 11, outOfStock: 2 },
  { key: "electronics", inStock: 41, lowStock: 9, outOfStock: 5 },
];

export const responseTimeByWeekday: Array<{
  key: AnalyticsWeekdayKey;
  minutes: number;
}> = [
  { key: "mon", minutes: 11 },
  { key: "tue", minutes: 13 },
  { key: "wed", minutes: 10 },
  { key: "thu", minutes: 14 },
  { key: "fri", minutes: 17 },
  { key: "sat", minutes: 21 },
  { key: "sun", minutes: 24 },
];

export const orderSources: Array<{
  key: AnalyticsOrderSourceKey;
  value: number;
}> = [
  { key: "instagramStory", value: 142 },
  { key: "instagramDm", value: 198 },
  { key: "catalogLink", value: 87 },
  { key: "telegramBot", value: 56 },
  { key: "manual", value: 38 },
];

export const teamOrdersHandled: Array<{
  key: AnalyticsTeamMemberKey;
  orders: number;
}> = [
  { key: "olena", orders: 148 },
  { key: "andrii", orders: 132 },
  { key: "maria", orders: 119 },
  { key: "dmytro", orders: 94 },
];

export const messageActivityHeatmap: {
  days: AnalyticsHeatmapDayKey[];
  hours: string[];
  values: Array<[number, number, number]>;
} = {
  days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  hours: ["9", "11", "13", "15", "17", "19", "21"],
  values: [
    [0, 0, 12], [0, 1, 18], [0, 2, 24], [0, 3, 31], [0, 4, 28], [0, 5, 16], [0, 6, 8],
    [1, 0, 14], [1, 1, 22], [1, 2, 29], [1, 3, 35], [1, 4, 30], [1, 5, 18], [1, 6, 9],
    [2, 0, 13], [2, 1, 20], [2, 2, 27], [2, 3, 33], [2, 4, 29], [2, 5, 17], [2, 6, 7],
    [3, 0, 15], [3, 1, 23], [3, 2, 30], [3, 3, 38], [3, 4, 32], [3, 5, 19], [3, 6, 10],
    [4, 0, 16], [4, 1, 25], [4, 2, 34], [4, 3, 42], [4, 4, 36], [4, 5, 22], [4, 6, 11],
    [5, 0, 9], [5, 1, 14], [5, 2, 21], [5, 3, 26], [5, 4, 24], [5, 5, 28], [5, 6, 19],
    [6, 0, 7], [6, 1, 11], [6, 2, 16], [6, 3, 20], [6, 4, 18], [6, 5, 22], [6, 6, 15],
  ],
};
