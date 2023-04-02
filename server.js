const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const admin = require('firebase-admin');

// Load protobuf file
const packageDefinition = protoLoader.loadSync('path/to/your/proto/file.proto');
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Initialize Firebase app
admin.initializeApp({
  credential: admin.credential.cert('path/to/your/serviceAccountKey.json'),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

// Get the OrderService object and create a gRPC server
const orderService = grpcObject.OrderService;
const server = new grpc.Server();

// Implement the logic for creating an order
const createOrder = (call, callback) => {
  const user_id = call.request.user_id;
  const ticket = call.request.ticket;
  // Generate a random order ID
  const order_id = Math.random().toString(36).substr(2, 9);
  console.log('Order created:', order_id);

  // Add the order to Firebase database
  const db = admin.firestore();
  db.collection('orders').doc(order_id).set({ user_id: user_id, ticket: ticket })
    .then(() => {
      console.log('Order added to database:', order_id);
      callback(null, { order_id: order_id });
    })
    .catch((error) => {
      console.error('Error adding order to database:', error);
      callback(error);
    });
};

// Implement the logic for getting an order
const getOrder = (call, callback) => {
  const order_id = call.request.order_id;
  // Get the order from Firebase database
  const db = admin.firestore();
  db.collection('orders').doc(order_id).get()
    .then((doc) => {
      if (!doc.exists) {
        console.error('Order not found:', order_id);
        callback({ code: grpc.status.NOT_FOUND, message: 'Order not found' });
      } else {
        const data = doc.data();
        const order = { order_id: order_id, user_id: data.user_id, ticket: data.ticket };
        console.log('Order:', order);
        callback(null, { order: order });
      }
    })
    .catch((error) => {
      console.error('Error getting order from database:', error);
      callback(error);
    });
};

// Implement the logic for cancelling an order
const cancelOrder = (call, callback) => {
  const order_id = call.request.order_id;
  // Delete the order from Firebase database
  const db = admin.firestore();
  db.collection('orders').doc(order_id).delete()
    .then(() => {
      console.log('Order cancelled:', order_id);
      callback(null, { success: true });
    })
    .catch((error) => {
      console.error('Error cancelling order:', error);
      callback(error);
    });
};

// Add the methods to the server
server.addService(orderService.service, { CreateOrder: createOrder, GetOrder: getOrder, CancelOrder: cancelOrder });

// Start the server
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
console.log('Server running at http://0.0.0.0:50051');
server.start();
