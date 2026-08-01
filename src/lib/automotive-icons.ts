import {
  CarFront,
  Wrench,
  Package,
  SprayCan,
  BatteryCharging,
  BadgeIndianRupee,
  CarTaxiFront,
  Headset,
  UserCog,
  Factory,
  Truck,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId } from './automotive';

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  sales: CarFront,
  service: Wrench,
  'spare-parts': Package,
  'body-shop': SprayCan,
  ev: BatteryCharging,
  finance: BadgeIndianRupee,
  'pre-owned': CarTaxiFront,
  crm: Headset,
  management: UserCog,
  manufacturing: Factory,
  logistics: Truck,
  support: ClipboardList,
};
