const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');
const options =
{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

// Load protobuf file
const packageDefinition = protoLoader.loadSync('./ticket.proto', options);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ticket'
});

// Connect to MySQL
connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL:', error);
  } else {
    console.log('Connected to MySQL');
  }
});

// Get the OrderService object and create a gRPC server
const orderService = grpcObject.ticket.OrderService;
const server = new grpc.Server();

// Implement the logic for creating an order
const createOrder = (call, callback) => {
  const order_id = call.request.order_id;
  const user_id = call.request.user_id;
  const ticket = call.request.ticket;

  // Insert the order into the database
  const sql = `INSERT INTO orders (order_id, user_id, ticket) VALUES (?, ?, ?)`;
  const values = [order_id, user_id, ticket];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error adding order to database:', error);
      callback(error);
    } else {
      console.log('Order added to database:', order_id);
      callback(null, { success: true });
    }
  });
};

// Implement the logic for getting an order
const getOrder = (call, callback) => {
  const order_id = call.request.order_id;

  // Retrieve the order from the database
  const sql = `SELECT * FROM orders WHERE order_id = ?`;
  const values = [order_id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error getting order from database:', error);
      callback(error);
    } else {
      if (results.length === 0) {
        console.error('Order not found:', order_id);
        callback({ code: grpc.status.NOT_FOUND, message: 'Order not found' });
      } else {
        const order = {
          order_id: results[0].order_id,
          user_id: results[0].user_id,
          ticket: results[0].ticket
        };
        console.log('Order:', order);
        callback(null, { order: order });
      }
    }
  });
};

// Implement the logic for updating an order
const updateOrder = (call, callback) => {
  const order_id = call.request.order_id;
  const user_id = call.request.user_id;
  const ticket = call.request.ticket;

  // Update the order in the database
  const sql = `UPDATE orders SET user_id = ?, ticket = ? WHERE order_id = ?`;
  const values = [user_id, ticket, order_id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error updating order:', error);
      callback(error);
    } else {
      console.log('Order updated:', order_id);
      callback(null, { success: true });
    }
  });
};

// Implement the logic for cancelling an order
const cancelOrder = (call, callback) => {
  const order_id = call.request.order_id;

  // Delete the order from the database
  const sql = `DELETE FROM orders WHERE order_id = ?`;
  const values = [order_id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error cancelling order:', error);
      callback(error);
    } else {
      console.log('Order cancelled:', order_id);
      callback(null, { success: true });
    }
  });
};

// Add the methods to the server
server.addService(orderService.service, {
  CreateOrder: createOrder,
  GetOrder: getOrder,
  UpdateOrder: updateOrder,
  CancelOrder: cancelOrder
});

// Start the server
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running at http://0.0.0.0:50051');
  server.start();
});
