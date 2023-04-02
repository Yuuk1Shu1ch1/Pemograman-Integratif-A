const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// Load protobuf file
const packageDefinition = protoLoader.loadSync('path/to/your/proto/file.proto');
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Get the OrderService object and create a gRPC client
const orderService = grpcObject.OrderService;
const client = new orderService('localhost:50051', grpc.credentials.createInsecure());

// Implement the logic for creating an order
const createOrder = (user_id, ticket) => {
  client.CreateOrder({ user_id: user_id, ticket: ticket }, (err, response) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Order created:', response.order_id);
  });
};

// Implement the logic for getting an order
const getOrder = (order_id) => {
  client.GetOrder({ order_id: order_id }, (err, response) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Order:', response.order);
  });
};

// Implement the logic for cancelling an order
const cancelOrder = (order_id) => {
  client.CancelOrder({ order_id: order_id }, (err, response) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Order cancelled:', response.success);
  });
};

// Call the methods
createOrder('123', { event_name: 'Event A', event_location: 'Location A', event_date: '2023-05-01', available_seats: 100, ticket_price: 50.0 });
getOrder('123');
cancelOrder('123');
