const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');

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

console.log(packageDefinition);

const usersProto = grpc.loadPackageDefinition(packageDefinition);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ticket'
});

db.connect((error) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log('Connected to database')
});

const server = new grpc.Server();

server.addService(usersProto.OrderService.service, {
  ListUser:(call, callback) => {
    db.query('SELECT * FROM data', (error, results) => {
        if (error) {
            console.error(error);
            callback(error, null);
            return;
          }
          const users = results
        if (!users.length) {
            callback({ code: grpc.status.NOT_FOUND, details: 'User not found' }, null);
            return;
        }
    })
    callback(null, { users });
  },  
  CreateOrder: (call, callback) => {
    const user = call.request;
    db.query('INSERT INTO data SET ?', user, (error, result) => {
      if (error) {
        console.error(error);
      }
      callback(error, null);
      // user.id = result.insertId;
      callback(null, { success: true, user });
    });
  },
  GetOrder: (call, callback) => {
    const id = call.request.id;
    db.query('SELECT * FROM data WHERE order_id = ?', [order_id], (error, results) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      }
      const user = results[0];
      if (!user) {
        callback({ code: grpc.status.NOT_FOUND, details: 'User not found' }, null);
        return;
      }
      callback(null, { user });
    });
  },
  UpdateOrder: (call, callback) => {
    const user = call.request;
    db.query('UPDATE data SET user_id = ?, ticket = ? WHERE order_id = ?', [user.user_id, user.ticket, user.order_id], (error) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      }
      callback(null, { success: true });
    });
  },
  DeleteOrder: (call, callback) => {
    const id = call.request.id;
    db.query('DELETE FROM data WHERE order_id = ?', [order_id], (error) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
    }
    callback(null, { success: true });
    });
  }
});



server.bindAsync('127.0.0.1:3500', grpc.ServerCredentials.createInsecure(),
(error, port) => {
  console.log("Server running at http://127.0.0.1:3500");
  server.start();
}
)
