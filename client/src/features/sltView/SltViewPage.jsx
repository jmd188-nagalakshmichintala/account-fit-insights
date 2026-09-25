import { useState, useMemo } from "react";
import { useAccountOwners } from "@/features/accountProductFit/hooks/useAccountOwners";
import { mapAccountOwnerOptions } from "@/features/accountProductFit/utils/accountProductFit.utils";
import { useRegions } from "./hooks/useRegions";
import { mapRegionOptions } from "./utils/sltView.utils";
import { SummarySection } from "./components/SummarySection";
import { FiltersSection } from "./components/FiltersSection";
import { ProductFitByRepSection } from "./components/ProductFitByRepSection";
import { ProductsAcrossScoresSection } from "./components/ProductsAcrossScoresSection";

export function SltViewPage() {
  const [segmentFilter, setSegmentFilter] = useState("");
  const [salesRepFilter, setSalesRepFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [accountFitTab, setAccountFitTab] = useState("products");
  const [propensityTab, setPropensityTab] = useState("products");
  const [showOpenOpportunity, setShowOpenOpportunity] = useState(false);

  const owners = useAccountOwners();
  const regions = useRegions();

  const filters = useMemo(
    () => ({
      segment: segmentFilter || null,
      salesRep: salesRepFilter || null,
      region: regionFilter || null,
      product: productFilter || null,
    }),
    [segmentFilter, salesRepFilter, regionFilter, productFilter],
  );

  const scoreFilters = useMemo(
    () => ({
      ...filters,
      hasOpenOpp: showOpenOpportunity,
    }),
    [filters, showOpenOpportunity],
  );

  const salesRepOptions = useMemo(
    () => mapAccountOwnerOptions(owners.data),
    [owners.data],
  );

  const regionOptions = useMemo(
    () => mapRegionOptions(regions.data),
    [regions.data],
  );

  const handleClearFilters = () => {
    setSegmentFilter("");
    setSalesRepFilter("");
    setRegionFilter("");
    setProductFilter("");
  };

  return (
    <div className="px-6 pt-6">
      <SummarySection filters={filters} />

      <FiltersSection
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
        salesRepFilter={salesRepFilter}
        onSalesRepChange={setSalesRepFilter}
        salesRepOptions={salesRepOptions}
        regionFilter={regionFilter}
        onRegionChange={setRegionFilter}
        regionOptions={regionOptions}
        productFilter={productFilter}
        onProductChange={setProductFilter}
        onClearFilters={handleClearFilters}
      />

      <ProductFitByRepSection
        filters={filters}
        activeTab={accountFitTab}
        onTabChange={setAccountFitTab}
      />

      <ProductsAcrossScoresSection
        filters={scoreFilters}
        showOpenOpportunity={showOpenOpportunity}
        onToggleOpenOpportunity={setShowOpenOpportunity}
        activeTab={propensityTab}
        onTabChange={setPropensityTab}
      />
    </div>
  );
}
