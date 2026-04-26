import PlateMirepoix from "./PlateMirepoix";
import PlateKitchenSafety from "./PlateKitchenSafety";
import PlateSnackPlate from "./PlateSnackPlate";
import PlateRiceWorld from "./PlateRiceWorld";
import PlateKnifeCuts from "./PlateKnifeCuts";
import PlateFoodTruck from "./PlateFoodTruck";
import PlateRestaurant from "./PlateRestaurant";

export const PLATES = {
  "mirepoix": PlateMirepoix,
  "kitchen-safety": PlateKitchenSafety,
  "snack-plate": PlateSnackPlate,
  "rice-world": PlateRiceWorld,
  "knife-cuts": PlateKnifeCuts,
  "food-truck": PlateFoodTruck,
  "restaurant": PlateRestaurant,
};

export function getPlate(key) {
  return PLATES[key] || PlateKitchenSafety;
}
