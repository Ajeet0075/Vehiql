"use client";

import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const CarFilterControls = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilter,
}) => {
    const { make, bodyType, fuelType, transmission, priceRange } = currentFilters;

  const filterSections = [
    {
      id: "make",
      title: "Make",
      options: filters.makes.map((make) => ({ value: make, label: make })),
      currentValue: make,
      onChange: (value) => onFilterChange("make", value),
    },
    {
      id: "bodyType",
      title: "Body Type",
      options: filters.bodyTypes.map((type) => ({ value: type, label: type })),
      currentValue: bodyType,
      onChange: (value) => onFilterChange("bodyType", value),
    },
    {
      id: "fuelType",
      title: "Fuel Type",
      options: filters.fuelTypes.map((type) => ({ value: type, label: type })),
      currentValue: fuelType,
      onChange: (value) => onFilterChange("fuelType", value),
    },
    {
      id: "transmission",
      title: "Transmission",
      options: filters.transmissions.map((type) => ({
        value: type,
        label: type,
      })),
      currentValue: transmission,
      onChange: (value) => onFilterChange("transmission", value),
    },
  ];

  return (
  <div className="space-y-8">
    {/* Price Range Filter */}
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Price Range</h3>

      <div className="px-2">
        <Slider
          min={filters.priceRange.min}
          max={filters.priceRange.max}
          step={100}
          value={priceRange}
          onValueChange={(value) => onFilterChange("priceRange", value)}
        />
      </div>

      <div className="flex justify-between text-sm font-medium text-gray-600 px-2">
        <span>${priceRange[0]}</span>
        <span>${priceRange[1]}</span>
      </div>
    </div>

    {/* Dynamic Filter Sections */}
    {filterSections.map((section) => (
      <div key={section.id} className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-semibold text-gray-800">
            {section.title}
          </h4>
          {section.currentValue && (
            <button
              onClick={() => onClearFilter(section.id)}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {section.options.map((option) => {
            const isActive = section.currentValue === option.value;
            return (
              <Badge
                key={option.value}
                variant={isActive ? "default" : "outline"}
                onClick={() =>
                  section.onChange(isActive ? "" : option.value)
                }
                className={`px-3 py-1 text-sm cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
                {isActive && (
                  <Check className="ml-1 h-3 w-3 inline text-blue-700" />
                )}
              </Badge>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);


}

export default CarFilterControls