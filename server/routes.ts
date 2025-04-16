import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";

interface ClientConnection {
  ws: WebSocket;
  tenantId: number | null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: ClientConnection[] = [];
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    const client: ClientConnection = { ws, tenantId: null };
    clients.push(client);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message to set tenantId for the connection
        if (data.type === 'auth' && data.tenantId) {
          client.tenantId = parseInt(data.tenantId);
          console.log(`Client authenticated for tenant ${client.tenantId}`);
        }
        
        // Handle table status updates
        if (data.type === 'table_update' && data.tableId && data.status) {
          const tableId = parseInt(data.tableId);
          await storage.updateTableStatus(tableId, data.status);
          
          // Broadcast the update to all clients with the same tenantId
          const table = await storage.getTable(tableId);
          if (table) {
            broadcastToTenant(table.tenantId, {
              type: 'table_updated',
              table
            });
          }
        }
        
        // Handle order status updates
        if (data.type === 'order_update' && data.orderId && data.status) {
          const orderId = parseInt(data.orderId);
          await storage.updateOrder(orderId, { status: data.status });
          
          // Broadcast the update to all clients with the same tenantId
          const order = await storage.getOrder(orderId);
          if (order) {
            broadcastToTenant(order.tenantId, {
              type: 'order_updated',
              order
            });
          }
        }
        
        // Handle order item status updates
        if (data.type === 'order_item_update' && data.orderItemId && data.status) {
          const orderItemId = parseInt(data.orderItemId);
          await storage.updateOrderItem(orderItemId, { status: data.status });
          
          // Get the order to find tenant
          const orderItem = await storage.getOrderItem(orderItemId);
          if (orderItem) {
            const order = await storage.getOrder(orderItem.orderId);
            if (order) {
              broadcastToTenant(order.tenantId, {
                type: 'order_item_updated',
                orderItem
              });
            }
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      const index = clients.findIndex(c => c.ws === ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      console.log('WebSocket client disconnected');
    });
  });
  
  // Helper function to broadcast to all clients of a specific tenant
  function broadcastToTenant(tenantId: number, data: any) {
    clients.forEach(client => {
      if (client.tenantId === tenantId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }
  
  // API Routes
  // Tenants
  app.get('/api/tenants/:id', async (req, res) => {
    const tenant = await storage.getTenant(parseInt(req.params.id));
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json(tenant);
  });
  
  // Users
  
  app.get('/api/tenants/:tenantId/users', async (req, res) => {
    const users = await storage.getUsersByTenant(parseInt(req.params.tenantId));
    res.json(users.map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive
    })));
  });
  
  // Areas
  app.get('/api/tenants/:tenantId/areas', async (req, res) => {
    const areas = await storage.getAreasByTenant(parseInt(req.params.tenantId));
    res.json(areas);
  });
  
  app.post('/api/tenants/:tenantId/areas', async (req, res) => {
    const { name } = req.body;
    const tenantId = parseInt(req.params.tenantId);
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const area = await storage.createArea({
      tenantId,
      name,
      isActive: true
    });
    
    res.status(201).json(area);
  });
  
  // Tables
  app.get('/api/tenants/:tenantId/tables', async (req, res) => {
    const tables = await storage.getTablesByTenant(parseInt(req.params.tenantId));
    res.json(tables);
  });
  
  app.get('/api/areas/:areaId/tables', async (req, res) => {
    const tables = await storage.getTablesByArea(parseInt(req.params.areaId));
    res.json(tables);
  });
  
  app.post('/api/tenants/:tenantId/tables', async (req, res) => {
    const { name, areaId, capacity, posX, posY } = req.body;
    const tenantId = parseInt(req.params.tenantId);
    
    if (!name || !areaId) {
      return res.status(400).json({ message: 'Name and areaId are required' });
    }
    
    const table = await storage.createTable({
      tenantId,
      areaId: parseInt(areaId),
      name,
      capacity: capacity || 4,
      posX: posX || 0,
      posY: posY || 0,
      status: 'empty',
      isActive: true
    });
    
    res.status(201).json(table);
  });
  
  app.patch('/api/tables/:id', async (req, res) => {
    const tableId = parseInt(req.params.id);
    const { status, areaId, name, capacity, posX, posY } = req.body;
    
    const updatedTable = await storage.updateTable(tableId, {
      status,
      areaId: areaId ? parseInt(areaId) : undefined,
      name,
      capacity,
      posX,
      posY
    });
    
    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json(updatedTable);
  });
  
  // Categories
  app.get('/api/tenants/:tenantId/categories', async (req, res) => {
    const categories = await storage.getCategoriesByTenant(parseInt(req.params.tenantId));
    res.json(categories);
  });
  
  app.post('/api/tenants/:tenantId/categories', async (req, res) => {
    const { name, image, sortOrder } = req.body;
    const tenantId = parseInt(req.params.tenantId);
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const category = await storage.createCategory({
      tenantId,
      name,
      image,
      sortOrder: sortOrder || 0,
      isActive: true
    });
    
    res.status(201).json(category);
  });
  
  // Menu Items
  app.get('/api/tenants/:tenantId/menu-items', async (req, res) => {
    const menuItems = await storage.getMenuItemsByTenant(parseInt(req.params.tenantId));
    res.json(menuItems);
  });
  
  app.get('/api/categories/:categoryId/menu-items', async (req, res) => {
    const menuItems = await storage.getMenuItemsByCategory(parseInt(req.params.categoryId));
    res.json(menuItems);
  });
  
  app.post('/api/tenants/:tenantId/menu-items', async (req, res) => {
    const { name, categoryId, description, image, price, preparationTime, isAvailable } = req.body;
    const tenantId = parseInt(req.params.tenantId);
    
    if (!name || !categoryId || !price) {
      return res.status(400).json({ message: 'Name, categoryId, and price are required' });
    }
    
    const menuItem = await storage.createMenuItem({
      tenantId,
      categoryId: parseInt(categoryId),
      name,
      description,
      image,
      price: price.toString(),
      preparationTime,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isActive: true
    });
    
    res.status(201).json(menuItem);
  });
  
  app.patch('/api/menu-items/:id', async (req, res) => {
    const menuItemId = parseInt(req.params.id);
    const { name, categoryId, description, image, price, preparationTime, isAvailable } = req.body;
    
    const updatedMenuItem = await storage.updateMenuItem(menuItemId, {
      name,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      description,
      image,
      price: price ? price.toString() : undefined,
      preparationTime,
      isAvailable
    });
    
    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(updatedMenuItem);
  });
  
  // Orders
  app.get('/api/tenants/:tenantId/orders', async (req, res) => {
    const active = req.query.active === 'true';
    let orders;
    
    if (active) {
      orders = await storage.getActiveOrdersByTenant(parseInt(req.params.tenantId));
    } else {
      orders = await storage.getOrdersByTenant(parseInt(req.params.tenantId));
    }
    
    res.json(orders);
  });
  
  app.get('/api/tables/:tableId/orders', async (req, res) => {
    const orders = await storage.getOrdersByTable(parseInt(req.params.tableId));
    res.json(orders);
  });
  
  app.post('/api/tenants/:tenantId/orders', async (req, res) => {
    const { tableId, userId, customerCount } = req.body;
    const tenantId = parseInt(req.params.tenantId);
    
    if (!tableId || !userId) {
      return res.status(400).json({ message: 'TableId and userId are required' });
    }
    
    // First update the table status to occupied
    await storage.updateTableStatus(parseInt(tableId), 'occupied');
    
    const order = await storage.createOrder({
      tenantId,
      tableId: parseInt(tableId),
      userId: parseInt(userId),
      status: 'active',
      startTime: new Date(),
      customerCount: customerCount || 1
    });
    
    res.status(201).json(order);
  });
  
  app.patch('/api/orders/:id', async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status, endTime, totalAmount, isPaid, paymentMethod } = req.body;
    
    const updatedOrder = await storage.updateOrder(orderId, {
      status,
      endTime: endTime ? new Date(endTime) : undefined,
      totalAmount: totalAmount?.toString(),
      isPaid,
      paymentMethod
    });
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If the order is completed, update the table status to empty
    if (status === 'completed') {
      await storage.updateTableStatus(updatedOrder.tableId, 'empty');
    }
    
    // If the order needs payment, update the table status to bill_requested
    if (status === 'active' && isPaid === false && updatedOrder.totalAmount !== "0") {
      await storage.updateTableStatus(updatedOrder.tableId, 'bill_requested');
    }
    
    res.json(updatedOrder);
  });
  
  // Order Items
  app.get('/api/orders/:orderId/items', async (req, res) => {
    const items = await storage.getOrderItemsByOrder(parseInt(req.params.orderId));
    
    // Fetch menu item details for each order item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        return {
          ...item,
          menuItem
        };
      })
    );
    
    res.json(itemsWithDetails);
  });
  
  app.post('/api/orders/:orderId/items', async (req, res) => {
    const { menuItemId, quantity, unitPrice, notes } = req.body;
    const orderId = parseInt(req.params.orderId);
    
    if (!menuItemId || !quantity || !unitPrice) {
      return res.status(400).json({ message: 'MenuItemId, quantity, and unitPrice are required' });
    }
    
    const orderItem = await storage.createOrderItem({
      orderId,
      menuItemId: parseInt(menuItemId),
      quantity: parseInt(quantity),
      unitPrice: unitPrice.toString(),
      status: 'new',
      notes
    });
    
    // Update the total amount of the order
    const order = await storage.getOrder(orderId);
    if (order) {
      const totalAmount = parseFloat(order.totalAmount || "0") + (parseFloat(unitPrice) * parseInt(quantity));
      await storage.updateOrder(orderId, { totalAmount: totalAmount.toString() });
    }
    
    res.status(201).json(orderItem);
  });
  
  app.patch('/api/order-items/:id', async (req, res) => {
    const orderItemId = parseInt(req.params.id);
    const { status, quantity, notes } = req.body;
    
    const updatedOrderItem = await storage.updateOrderItem(orderItemId, {
      status,
      quantity: quantity ? parseInt(quantity) : undefined,
      notes
    });
    
    if (!updatedOrderItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }
    
    res.json(updatedOrderItem);
  });
  
  // Dashboard Data
  app.get('/api/tenants/:tenantId/dashboard', async (req, res) => {
    const dashboardData = await storage.getDashboardData(parseInt(req.params.tenantId));
    res.json(dashboardData);
  });
  
  // Stats
  app.get('/api/tenants/:tenantId/stats', async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await storage.getStatsByTenant(parseInt(req.params.tenantId), days);
    res.json(stats);
  });
  
  return httpServer;
}
