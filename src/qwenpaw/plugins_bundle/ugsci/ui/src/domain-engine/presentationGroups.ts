export const BUSINESS_GROUPS = [
  {
    key: "storage",
    title: "储气库工程",
    domains: ["underground_gas_storage", "gas_storage"],
  },
  {
    key: "reservoir",
    title: "油气藏与生产工程",
    domains: ["reservoir_engineering", "production_engineering"],
  },
  { key: "geology", title: "测井与地质", domains: ["geology_well_logging"] },
  { key: "fluids", title: "流体性质", domains: ["fluid_thermodynamics"] },
  {
    key: "general",
    title: "通用科学计算",
    domains: ["scientific_computing", "data_modeling"],
  },
  { key: "other", title: "其他领域", domains: [] },
];

export function businessGroupFor(domain: string, engineId?: string) {
  if (engineId === "reservoir-visualization") return BUSINESS_GROUPS[2];
  return (
    BUSINESS_GROUPS.find((group) => group.domains.includes(domain)) ||
    BUSINESS_GROUPS[5]
  );
}
