const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './ticket.proto';
const options =
{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

// const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// const UserService = protoDescriptor.UserService;

const OrderService = grpc.loadPackageDefinition(packageDefinition).OrderService;

const client = new OrderService(
  "127.0.0.1:3500",
  grpc.credentials.createInsecure()
);

// const order_id = Math.random().toString(36).substr(2, 9);
// console.log('Order created:', order_id);
// module.exports = client;

function listUser() {
    client.listUser({}, (error, response) => {
    if (error) {
        console.error(error);
        return;
    }
    else{
        console.log('success fetch data')
        console.log(response)
    }
    //console.log(response.users);
    });
}

function getOrder(id) {
    client.GetOrder({ id }, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response.user);
    });
}

function CreateOrder(order_id, user_id, ticket) {
    const user = { order_id, user_id, ticket };
    client.CreateOrder(user, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response.user);
    });
}

function updateOrder(order_id, user_id, ticket) {
    const user = { order_id, user_id, ticket };
    client.UpdateOrder(user, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response);
    });
    }
    
    function deleteUser(order_id) {
    client.DeleteUser({ order_id }, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response);
    });
    }
    
     //listUser();
    ('1');
    // CreateOrder('4', 'Piead', '20');
    // updateOrder(1, 'Arkan', '21');
    // deleteUser(1);
