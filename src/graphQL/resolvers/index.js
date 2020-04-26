const user = require('./user');
const auth = require('./auth');

// Import all the resolvers
const resolvers = {
  Query: {},
  Mutation: {},
  // Subscription: {},
};

// Assign the queries to the specific object
Object.assign(
  resolvers.Query,
  user.Query,
);

// Assign the mutations to the specific object
Object.assign(
  resolvers.Mutation,
  user.Mutation,
  auth.Mutation,
);

// Assign the subscriptions to the specific object
// Object.assign(
//   resolvers.Subscription,
// );

module.exports = resolvers;