import { 
  tenants, InsertTenant, Tenant, 
  users, InsertUser, User,
  areas, InsertArea, Area,
  tables, InsertTable, Table,
  categories, InsertCategory, Category,
  menuItems, InsertMenuItem, MenuItem,
  deliveryPlatforms, InsertDeliveryPlatform, DeliveryPlatform,
  tenantDeliveryPlatforms, InsertTenantDeliveryPlatform, TenantDeliveryPlatform,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem, OrderItem,
  stats, InsertStat, Stat
} from "@shared/schema";
import { db } from './db';
import { and, asc, desc, eq, isNull, not } from 'drizzle-orm';

export interface IStorage {
  // Tenant operations
  getTenant(id: number): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByTenant(tenantId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Area operations
  getArea(id: number): Promise<Area | undefined>;
  getAreasByTenant(tenantId: number): Promise<Area[]>;
  createArea(area: InsertArea): Promise<Area>;
  updateArea(id: number, area: Partial<InsertArea>): Promise<Area | undefined>;
  
  // Table operations
  getTable(id: number): Promise<Table | undefined>;
  getTablesByTenant(tenantId: number): Promise<Table[]>;
  getTablesByArea(areaId: number): Promise<Table[]>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined>;
  updateTableStatus(id: number, status: string): Promise<Table | undefined>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByTenant(tenantId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // MenuItem operations
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByTenant(tenantId: number): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  
  // Delivery Platform operations
  getDeliveryPlatform(id: number): Promise<DeliveryPlatform | undefined>;
  getDeliveryPlatforms(): Promise<DeliveryPlatform[]>;
  createDeliveryPlatform(platform: InsertDeliveryPlatform): Promise<DeliveryPlatform>;
  updateDeliveryPlatform(id: number, platform: Partial<InsertDeliveryPlatform>): Promise<DeliveryPlatform | undefined>;
  
  // Tenant Delivery Platform operations
  getTenantDeliveryPlatform(id: number): Promise<TenantDeliveryPlatform | undefined>;
  getTenantDeliveryPlatformsByTenant(tenantId: number): Promise<TenantDeliveryPlatform[]>;
  getTenantDeliveryPlatformDetails(tenantId: number): Promise<Array<TenantDeliveryPlatform & { platformName: string }>>;
  createTenantDeliveryPlatform(tenantPlatform: InsertTenantDeliveryPlatform): Promise<TenantDeliveryPlatform>;
  updateTenantDeliveryPlatform(id: number, tenantPlatform: Partial<InsertTenantDeliveryPlatform>): Promise<TenantDeliveryPlatform | undefined>;
  deleteTenantDeliveryPlatform(id: number): Promise<void>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByTenant(tenantId: number): Promise<Order[]>;
  getActiveOrdersByTenant(tenantId: number): Promise<Order[]>;
  getOrdersByTable(tableId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // OrderItem operations
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, orderItem: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  
  // Stats operations
  getStatsByTenant(tenantId: number, days: number): Promise<Stat[]>;
  createStat(stat: InsertStat): Promise<Stat>;
  updateDailyStat(tenantId: number, stat: Partial<InsertStat>): Promise<Stat | undefined>;
  
  // Dashboard data
  getDashboardData(tenantId: number): Promise<{
    dailyRevenue: number;
    customerCount: number;
    averageCheck: number;
    occupancyRate: number;
    tables: Table[];
    activeOrders: any[]; // Orders with details
    popularItems: any[]; // Menu items with count
  }>;
}

export class DatabaseStorage implements IStorage {
  // Tenant operations
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db
      .insert(tenants)
      .values(tenant)
      .returning();
    return newTenant;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUsersByTenant(tenantId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }
  
  // Area operations
  async getArea(id: number): Promise<Area | undefined> {
    const [area] = await db.select().from(areas).where(eq(areas.id, id));
    return area || undefined;
  }

  async getAreasByTenant(tenantId: number): Promise<Area[]> {
    return db.select().from(areas).where(eq(areas.tenantId, tenantId));
  }

  async createArea(area: InsertArea): Promise<Area> {
    const [newArea] = await db
      .insert(areas)
      .values(area)
      .returning();
    return newArea;
  }

  async updateArea(id: number, area: Partial<InsertArea>): Promise<Area | undefined> {
    const [updatedArea] = await db
      .update(areas)
      .set(area)
      .where(eq(areas.id, id))
      .returning();
    return updatedArea || undefined;
  }
  
  // Table operations
  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table || undefined;
  }

  async getTablesByTenant(tenantId: number): Promise<Table[]> {
    return db.select().from(tables).where(eq(tables.tenantId, tenantId));
  }

  async getTablesByArea(areaId: number): Promise<Table[]> {
    return db.select().from(tables).where(eq(tables.areaId, areaId));
  }

  async createTable(table: InsertTable): Promise<Table> {
    const [newTable] = await db
      .insert(tables)
      .values(table)
      .returning();
    return newTable;
  }

  async updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined> {
    const [updatedTable] = await db
      .update(tables)
      .set(table)
      .where(eq(tables.id, id))
      .returning();
    return updatedTable || undefined;
  }

  async updateTableStatus(id: number, status: string): Promise<Table | undefined> {
    const [updatedTable] = await db
      .update(tables)
      .set({ status })
      .where(eq(tables.id, id))
      .returning();
    return updatedTable || undefined;
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoriesByTenant(tenantId: number): Promise<Category[]> {
    return db.select()
      .from(categories)
      .where(eq(categories.tenantId, tenantId))
      .orderBy(asc(categories.sortOrder));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  // MenuItem operations
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem || undefined;
  }

  async getMenuItemsByTenant(tenantId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.tenantId, tenantId));
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId));
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [newMenuItem] = await db
      .insert(menuItems)
      .values(menuItem)
      .returning();
    return newMenuItem;
  }

  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set(menuItem)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem || undefined;
  }
  
  // Delivery Platform operations
  async getDeliveryPlatform(id: number): Promise<DeliveryPlatform | undefined> {
    const [platform] = await db.select().from(deliveryPlatforms).where(eq(deliveryPlatforms.id, id));
    return platform || undefined;
  }

  async getDeliveryPlatforms(): Promise<DeliveryPlatform[]> {
    return db.select().from(deliveryPlatforms).orderBy(asc(deliveryPlatforms.name));
  }

  async createDeliveryPlatform(platform: InsertDeliveryPlatform): Promise<DeliveryPlatform> {
    const [newPlatform] = await db
      .insert(deliveryPlatforms)
      .values(platform)
      .returning();
    return newPlatform;
  }

  async updateDeliveryPlatform(id: number, platform: Partial<InsertDeliveryPlatform>): Promise<DeliveryPlatform | undefined> {
    const [updatedPlatform] = await db
      .update(deliveryPlatforms)
      .set(platform)
      .where(eq(deliveryPlatforms.id, id))
      .returning();
    return updatedPlatform || undefined;
  }
  
  // Tenant Delivery Platform operations
  async getTenantDeliveryPlatform(id: number): Promise<TenantDeliveryPlatform | undefined> {
    const [tenantPlatform] = await db.select().from(tenantDeliveryPlatforms).where(eq(tenantDeliveryPlatforms.id, id));
    return tenantPlatform || undefined;
  }

  async getTenantDeliveryPlatformsByTenant(tenantId: number): Promise<TenantDeliveryPlatform[]> {
    return db.select().from(tenantDeliveryPlatforms).where(eq(tenantDeliveryPlatforms.tenantId, tenantId));
  }

  async getTenantDeliveryPlatformDetails(tenantId: number): Promise<Array<TenantDeliveryPlatform & { platformName: string }>> {
    const tenantPlatforms = await this.getTenantDeliveryPlatformsByTenant(tenantId);
    
    const results = [];
    for (const tp of tenantPlatforms) {
      const platform = await this.getDeliveryPlatform(tp.platformId);
      if (platform) {
        results.push({
          ...tp,
          platformName: platform.name
        });
      }
    }
    
    return results;
  }

  async createTenantDeliveryPlatform(tenantPlatform: InsertTenantDeliveryPlatform): Promise<TenantDeliveryPlatform> {
    const [newTenantPlatform] = await db
      .insert(tenantDeliveryPlatforms)
      .values(tenantPlatform)
      .returning();
    return newTenantPlatform;
  }

  async updateTenantDeliveryPlatform(id: number, tenantPlatform: Partial<InsertTenantDeliveryPlatform>): Promise<TenantDeliveryPlatform | undefined> {
    const [updatedTenantPlatform] = await db
      .update(tenantDeliveryPlatforms)
      .set(tenantPlatform)
      .where(eq(tenantDeliveryPlatforms.id, id))
      .returning();
    return updatedTenantPlatform || undefined;
  }

  async deleteTenantDeliveryPlatform(id: number): Promise<void> {
    await db
      .delete(tenantDeliveryPlatforms)
      .where(eq(tenantDeliveryPlatforms.id, id));
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByTenant(tenantId: number): Promise<Order[]> {
    return db.select()
      .from(orders)
      .where(eq(orders.tenantId, tenantId))
      .orderBy(desc(orders.startTime));
  }

  async getActiveOrdersByTenant(tenantId: number): Promise<Order[]> {
    return db.select()
      .from(orders)
      .where(and(
        eq(orders.tenantId, tenantId),
        eq(orders.status, 'active')
      ));
  }

  async getOrdersByTable(tableId: number): Promise<Order[]> {
    return db.select()
      .from(orders)
      .where(eq(orders.tableId, tableId))
      .orderBy(desc(orders.startTime));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder> & { totalAmount?: string, isPaid?: boolean, paymentMethod?: string | null, endTime?: Date | null }): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set(orderData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  // OrderItem operations
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    const [orderItem] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return orderItem || undefined;
  }

  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  async updateOrderItem(id: number, orderItem: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const [updatedOrderItem] = await db
      .update(orderItems)
      .set(orderItem)
      .where(eq(orderItems.id, id))
      .returning();
    return updatedOrderItem || undefined;
  }
  
  // Stats operations
  async getStatsByTenant(tenantId: number, days: number = 7): Promise<Stat[]> {
    return db.select()
      .from(stats)
      .where(eq(stats.tenantId, tenantId))
      .orderBy(desc(stats.date))
      .limit(days);
  }

  async createStat(stat: InsertStat): Promise<Stat> {
    const [newStat] = await db
      .insert(stats)
      .values(stat)
      .returning();
    return newStat;
  }

  async updateDailyStat(tenantId: number, statData: Partial<InsertStat>): Promise<Stat | undefined> {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if a stat for today already exists
    const [existingStat] = await db.select()
      .from(stats)
      .where(and(
        eq(stats.tenantId, tenantId),
        eq(stats.date, today)
      ));
    
    if (existingStat) {
      // Update existing stat
      const [updatedStat] = await db
        .update(stats)
        .set(statData)
        .where(eq(stats.id, existingStat.id))
        .returning();
      return updatedStat;
    } else {
      // Create new stat for today
      return this.createStat({
        tenantId,
        date: today,
        ...statData
      });
    }
  }
  
  // Dashboard data
  async getDashboardData(tenantId: number): Promise<{
    dailyRevenue: number;
    customerCount: number;
    averageCheck: number;
    occupancyRate: number;
    tables: Table[];
    activeOrders: any[]; // Orders with details
    popularItems: any[]; // Menu items with count
  }> {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's stats if exists
    const [todayStat] = await db.select()
      .from(stats)
      .where(and(
        eq(stats.tenantId, tenantId),
        eq(stats.date, today)
      ));
    
    // Get all tables for the tenant
    const tablesList = await this.getTablesByTenant(tenantId);
    
    // Get active orders with their items
    const activeOrdersList = await this.getActiveOrdersByTenant(tenantId);
    
    const activeOrdersWithDetails = [];
    
    // For each active order, get items and table details
    for (const order of activeOrdersList) {
      const orderItems = await this.getOrderItemsByOrder(order.id);
      const table = await this.getTable(order.tableId);
      
      if (!table) continue;
      
      const orderItemsWithDetails = [];
      let orderTotal = 0;
      
      // For each order item, get menu item details
      for (const item of orderItems) {
        const menuItem = await this.getMenuItem(item.menuItemId);
        
        if (menuItem) {
          orderItemsWithDetails.push({
            ...item,
            menuItem: {
              id: menuItem.id,
              name: menuItem.name,
              price: menuItem.price
            }
          });
          
          orderTotal += parseFloat(String(item.unitPrice)) * item.quantity;
        }
      }
      
      const durationMinutes = Math.floor((new Date().getTime() - order.startTime.getTime()) / 60000);
      
      activeOrdersWithDetails.push({
        ...order,
        table: {
          id: table.id,
          name: table.name
        },
        items: orderItemsWithDetails,
        totalAmount: orderTotal.toFixed(2),
        duration: durationMinutes
      });
    }
    
    // Get popular items (in a real app, this would be based on order history)
    // For now, we'll get 5 random menu items
    const allMenuItems = await this.getMenuItemsByTenant(tenantId);
    const popularItemCount = Math.min(5, allMenuItems.length);
    const popularItems = allMenuItems
      .slice(0, popularItemCount)
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        count: 20 - index * 2 // Fake count data for demo purposes
      }));
    
    return {
      dailyRevenue: todayStat ? parseFloat(String(todayStat.dailyRevenue)) : 0,
      customerCount: todayStat ? Number(todayStat.customerCount) : 0,
      averageCheck: todayStat ? parseFloat(String(todayStat.averageCheck)) : 0,
      occupancyRate: todayStat ? parseFloat(String(todayStat.occupancyRate)) : 0,
      tables: tablesList,
      activeOrders: activeOrdersWithDetails,
      popularItems
    };
  }
}

// Create and seed the database with initial data
async function seedDatabase() {
  try {
    // Check if tenants table is empty
    const existingTenants = await db.select().from(tenants);
    
    if (existingTenants.length === 0) {
      console.log('Seeding database with initial data...');
      
      // Create demo tenant
      const [demoTenant] = await db.insert(tenants).values({
        name: "Demo Restaurant",
        logo: null,
        address: "123 Main St, Example City",
        phone: "+90 555 123 4567",
        email: "info@demorestaurant.com",
        themeColor: "#4F46E5",
      }).returning();
      
      // Create demo user
      const [demoUser] = await db.insert(users).values({
        tenantId: demoTenant.id,
        username: "admin",
        password: "password", // In a real app, this would be hashed
        fullName: "Admin User",
        role: "admin",
        isActive: true,
      }).returning();
      
      // Create demo areas
      const [indoorArea] = await db.insert(areas).values({
        tenantId: demoTenant.id,
        name: "İç Alan",
        isActive: true,
      }).returning();
      
      const [outdoorArea] = await db.insert(areas).values({
        tenantId: demoTenant.id,
        name: "Dış Alan",
        isActive: true,
      }).returning();
      
      // Create demo tables
      for (let i = 1; i <= 10; i++) {
        await db.insert(tables).values({
          tenantId: demoTenant.id,
          areaId: i <= 6 ? indoorArea.id : outdoorArea.id,
          name: `Masa ${i}`,
          capacity: 4,
          posX: ((i-1) % 3) * 150,
          posY: Math.floor((i-1) / 3) * 120,
          status: "empty",
          isActive: true,
        });
      }
      
      // Create demo categories
      const categoryNames = ["İçecekler", "Başlangıçlar", "Ana Yemekler", "Tatlılar"];
      const demoCategories = [];
      
      for (let i = 0; i < categoryNames.length; i++) {
        const [category] = await db.insert(categories).values({
          tenantId: demoTenant.id,
          name: categoryNames[i],
          image: null,
          sortOrder: i,
          isActive: true,
        }).returning();
        
        demoCategories.push(category);
      }
      
      // Create demo menu items
      const menuItemsData = [
        { name: "Ayran", categoryId: demoCategories[0].id, price: "15.00", preparationTime: 1 },
        { name: "Kola", categoryId: demoCategories[0].id, price: "20.00", preparationTime: 1 },
        { name: "Çay", categoryId: demoCategories[0].id, price: "10.00", preparationTime: 3 },
        { name: "Mercimek Çorbası", categoryId: demoCategories[1].id, price: "35.00", preparationTime: 5 },
        { name: "Salata", categoryId: demoCategories[1].id, price: "40.00", preparationTime: 7 },
        { name: "Adana Kebap", categoryId: demoCategories[2].id, price: "150.00", preparationTime: 15 },
        { name: "Pide", categoryId: demoCategories[2].id, price: "80.00", preparationTime: 12 },
        { name: "Tavuk Şiş", categoryId: demoCategories[2].id, price: "120.00", preparationTime: 15 },
        { name: "Künefe", categoryId: demoCategories[3].id, price: "60.00", preparationTime: 10 },
        { name: "Baklava", categoryId: demoCategories[3].id, price: "75.00", preparationTime: 5 },
      ];
      
      const demoMenuItems = [];
      
      for (const item of menuItemsData) {
        const [menuItem] = await db.insert(menuItems).values({
          tenantId: demoTenant.id,
          categoryId: item.categoryId,
          name: item.name,
          price: item.price,
          preparationTime: item.preparationTime,
          description: null,
          image: null,
          isAvailable: true,
          isActive: true,
        }).returning();
        
        demoMenuItems.push(menuItem);
      }
      
      // Create a demo active order
      const now = new Date();
      const [activeOrder] = await db.insert(orders).values({
        tenantId: demoTenant.id,
        tableId: 1, // First table
        userId: demoUser.id,
        status: "active",
        startTime: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
        customerCount: 2,
      }).returning();
      
      // Add items to active order
      await db.insert(orderItems).values({
        orderId: activeOrder.id,
        menuItemId: demoMenuItems[2].id, // Çay
        quantity: 2,
        unitPrice: demoMenuItems[2].price,
        status: "served",
        notes: null,
      });
      
      await db.insert(orderItems).values({
        orderId: activeOrder.id,
        menuItemId: demoMenuItems[3].id, // Mercimek Çorbası
        quantity: 2,
        unitPrice: demoMenuItems[3].price,
        status: "served",
        notes: null,
      });
      
      await db.insert(orderItems).values({
        orderId: activeOrder.id,
        menuItemId: demoMenuItems[5].id, // Adana Kebap
        quantity: 1,
        unitPrice: demoMenuItems[5].price,
        status: "preparing",
        notes: "Az acılı",
      });
      
      await db.insert(orderItems).values({
        orderId: activeOrder.id,
        menuItemId: demoMenuItems[7].id, // Tavuk Şiş
        quantity: 1,
        unitPrice: demoMenuItems[7].price,
        status: "new",
        notes: null,
      });
      
      // Update table status to occupied
      await db.update(tables)
        .set({ status: "occupied" })
        .where(eq(tables.id, 1));
      
      // Create a completed order
      const [completedOrder] = await db.insert(orders).values({
        tenantId: demoTenant.id,
        tableId: 2, // Second table
        userId: demoUser.id,
        status: "completed",
        startTime: new Date(now.getTime() - 90 * 60000), // 90 minutes ago
        endTime: new Date(now.getTime() - 10 * 60000), // 10 minutes ago
        totalAmount: "350.00",
        isPaid: true,
        paymentMethod: "cash",
        customerCount: 4,
      }).returning();
      
      // Add items to completed order
      await db.insert(orderItems).values({
        orderId: completedOrder.id,
        menuItemId: demoMenuItems[1].id, // Kola
        quantity: 4,
        unitPrice: demoMenuItems[1].price,
        status: "served",
        notes: null,
      });
      
      await db.insert(orderItems).values({
        orderId: completedOrder.id,
        menuItemId: demoMenuItems[4].id, // Salata
        quantity: 2,
        unitPrice: demoMenuItems[4].price,
        status: "served",
        notes: null,
      });
      
      await db.insert(orderItems).values({
        orderId: completedOrder.id,
        menuItemId: demoMenuItems[6].id, // Pide
        quantity: 2,
        unitPrice: demoMenuItems[6].price,
        status: "served",
        notes: null,
      });
      
      await db.insert(orderItems).values({
        orderId: completedOrder.id,
        menuItemId: demoMenuItems[9].id, // Baklava
        quantity: 1,
        unitPrice: demoMenuItems[9].price,
        status: "served",
        notes: null,
      });
      
      // Create weekly stats
      for (let i = 7; i >= 1; i--) {
        const statDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const revenue = 1200 + (i * 100);
        const customers = 25 + (i * 3);
        const avgCheck = revenue / customers;
        const occupancy = 60 + (i * 5);
        
        await db.insert(stats).values({
          tenantId: demoTenant.id,
          date: statDate,
          dailyRevenue: revenue.toFixed(2),
          customerCount: customers,
          averageCheck: avgCheck.toFixed(2),
          occupancyRate: occupancy.toFixed(2),
        });
      }
      
      console.log('Database seeded successfully!');
    } else {
      console.log('Database already has data, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Initialize storage
export const storage = new DatabaseStorage();

// Seed the database with initial data
seedDatabase().catch(console.error);