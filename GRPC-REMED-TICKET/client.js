const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const options =
{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};
const app = express();
const port = 3000;

// Load protobuf file
const packageDefinition = protoLoader.loadSync('./ticket.proto', options);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Create gRPC client
const client = new grpcObject.ticket.OrderService('localhost:50051', grpc.credentials.createInsecure());

// Middleware for parsing JSON
app.use(bodyParser.json());

// Create an order
app.post('/order', (req, res) => {
  const { order_id, user_id, ticket } = req.body;

  const request = { order_id: order_id, user_id: user_id, ticket: ticket };
  client.CreateOrder(request, (error, response) => {
    if (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error creating order' });
    } else {
      console.log('Order created successfully');
      res.status(200).json({ "your order id": order_id });
    }
  });
});

// Get an order
app.get('/order/:order_id', (req, res) => {
  const order_id = req.params.order_id;

  const request = { order_id: order_id };
  client.GetOrder(request, (error, response) => {
    if (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Error getting order' });
    } else {
      console.log('Order:', response.order);
      res.status(200).json(response.order);
    }
  });
});

// Update an order
app.put('/order/:order_id', (req, res) => {
  const order_id = req.params.order_id;
  const { user_id, ticket } = req.body;

  const request = { order_id: order_id, user_id: user_id, ticket: ticket };
  client.UpdateOrder(request, (error, response) => {
    if (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Error updating order' });
    } else {
      console.log('Order updated successfully');
      res.status(200).json({ success: true });
    }
  });
});

// Cancel an order
app.delete('/order/:order_id', (req, res) => {
  const order_id = req.params.order_id;

  const request = { order_id: order_id };
  client.CancelOrder(request, (error, response) => {
    if (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: 'Error cancelling order' });
    } else {
      console.log('Order cancelled successfully');
      res.status(200).json({ success: true });
    }
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
