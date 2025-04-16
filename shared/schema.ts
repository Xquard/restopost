import { pgTable, text, serial, integer, boolean, jsonb, timestamp, foreignKey, uniqueIndex, numeric, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants (restaurant owners)
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  themeColor: text("theme_color").default("#4F46E5"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants).pick({
  name: true,
  logo: true,
  address: true,
  phone: true,
  email: true,
  themeColor: true,
});

// Users (staff)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("staff"), // admin, manager, waiter, chef
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  tenantId: true,
  username: true,
  password: true,
  fullName: true,
  role: true,
  isActive: true,
});

// Areas (indoor, outdoor, etc)
export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertAreaSchema = createInsertSchema(areas).pick({
  tenantId: true,
  name: true,
  isActive: true,
});

// Tables
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  areaId: integer("area_id").notNull().references(() => areas.id),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(4),
  posX: integer("pos_x").default(0),
  posY: integer("pos_y").default(0),
  status: text("status").notNull().default("empty"), // empty, occupied, bill_requested
  isActive: boolean("is_active").notNull().default(true),
});

export const insertTableSchema = createInsertSchema(tables).pick({
  tenantId: true,
  areaId: true,
  name: true,
  capacity: true,
  posX: true,
  posY: true,
  status: true,
  isActive: true,
});

// Menu Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  tenantId: true,
  name: true,
  image: true,
  sortOrder: true,
  isActive: true,
});

// Menu Items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: numeric("price").notNull(),
  preparationTime: integer("preparation_time"), // in minutes
  isAvailable: boolean("is_available").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  tenantId: true,
  categoryId: true,
  name: true,
  description: true,
  image: true,
  price: true,
  preparationTime: true,
  isAvailable: true,
  isActive: true,
});

// Delivery Platforms
export const deliveryPlatforms = pgTable("delivery_platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Getir, Yemeksepeti, vb.
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliveryPlatformSchema = createInsertSchema(deliveryPlatforms).pick({
  name: true,
  apiKey: true,
  secretKey: true,
  webhookUrl: true,
  isActive: true,
});

// Tenant Delivery Platform Integration
export const tenantDeliveryPlatforms = pgTable("tenant_delivery_platforms", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  platformId: integer("platform_id").notNull().references(() => deliveryPlatforms.id),
  merchantId: text("merchant_id").notNull(), // Platform üzerindeki restoran kimliği
  isActive: boolean("is_active").notNull().default(true),
  settings: jsonb("settings"), // Platform özel ayarlar
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSyncAt: timestamp("last_sync_at"),
});

export const insertTenantDeliveryPlatformSchema = createInsertSchema(tenantDeliveryPlatforms).pick({
  tenantId: true,
  platformId: true,
  merchantId: true,
  isActive: true,
  settings: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  tableId: integer("table_id").references(() => tables.id), // Null olabilir, paket servis için
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  totalAmount: numeric("total_amount").default("0"),
  isPaid: boolean("is_paid").notNull().default(false),
  paymentMethod: text("payment_method"),
  customerCount: integer("customer_count").default(1),
  // Dağıtım platformu bilgileri - Geçici olarak devre dışı bırakıldı
  // isDeliveryOrder: boolean("is_delivery_order").notNull().default(false),
  // deliveryPlatformId: integer("delivery_platform_id").references(() => deliveryPlatforms.id),
  // externalOrderId: text("external_order_id"), // Platform üzerindeki sipariş kimliği
  // deliveryStatus: text("delivery_status"), // preparing, ready, picked_up, delivered
  // customerAddress: text("customer_address"), // Teslimat adresi
  // customerPhone: text("customer_phone"), // Müşteri telefonu
  // customerName: text("customer_name"), // Müşteri adı
  // deliveryNotes: text("delivery_notes"), // Teslimat notları
  // estimatedDeliveryTime: timestamp("estimated_delivery_time"), // Tahmini teslimat süresi
  // deliveryFee: numeric("delivery_fee").default("0"), // Teslimat ücreti
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  tenantId: true,
  tableId: true,
  userId: true,
  status: true,
  startTime: true,
  customerCount: true,
  // Teslimat özellikleri geçici olarak devre dışı bırakıldı
  // isDeliveryOrder: true,
  // deliveryPlatformId: true,
  // externalOrderId: true,
  // deliveryStatus: true,
  // customerAddress: true,
  // customerPhone: true,
  // customerName: true,
  // deliveryNotes: true,
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull(),
  status: text("status").notNull().default("new"), // new, preparing, served, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  menuItemId: true,
  quantity: true,
  unitPrice: true,
  status: true,
  notes: true,
});

// Stats
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  date: timestamp("date").defaultNow().notNull(),
  dailyRevenue: numeric("daily_revenue").default("0"),
  customerCount: integer("customer_count").default(0),
  averageCheck: numeric("average_check").default("0"),
  occupancyRate: numeric("occupancy_rate").default("0"),
});

export const insertStatSchema = createInsertSchema(stats).pick({
  tenantId: true,
  date: true,
  dailyRevenue: true,
  customerCount: true,
  averageCheck: true,
  occupancyRate: true,
});

// Type exports
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Area = typeof areas.$inferSelect;
export type InsertArea = z.infer<typeof insertAreaSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type DeliveryPlatform = typeof deliveryPlatforms.$inferSelect;
export type InsertDeliveryPlatform = z.infer<typeof insertDeliveryPlatformSchema>;

export type TenantDeliveryPlatform = typeof tenantDeliveryPlatforms.$inferSelect;
export type InsertTenantDeliveryPlatform = z.infer<typeof insertTenantDeliveryPlatformSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;
