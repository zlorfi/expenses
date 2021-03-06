// create collections
Categories = new Mongo.Collection("categories");
Expenses = new Mongo.Collection("expenses");

// extend schemas
var Schemas = {};

Schemas.Category = new SimpleSchema({
  name: {type: String, max: 200, denyInsert: true}
});

Schemas.Expense = new SimpleSchema({
  description: {type: String, min: 2},
  amount: {type: Number, decimal: true},
  createdAt: {type: Date, autoValue: function() {if (this.isInsert) { return new Date; }}},
  categories: {type: Schemas.Categories},
  owner: {type: String, autoValue: function() {if (this.isInsert) { return Meteor.userId(); }}}
});

Expenses.attachSchema(Schemas.Expense);
Categories.attachSchema(Schemas.Category);

// Disable signup
Accounts.config({
  // forbidClientAccountCreation: true
});

Expenses.allow({
  insert: function() {
      return true;
  }
  ,remove: function(){
      return true;
  }
});
