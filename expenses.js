if (Meteor.isClient) {
  // Username only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

  // Meteor.subscribe("allExpenses");
  Meteor.subscribe("allCategories");
  Meteor.subscribe("allUsers");

  Meteor.Spinner.options = {
      scale: 2.5
  };

  Template.registerHelper("categoriesOptions", function() {
    array = []
    Categories.find().fetch().forEach(function(c) {
        array.push({label: c.name, value: c._id});
      });
    return array;
  });

  Template.showExpenses.helpers({
    expenses: function() {
      return Expenses.find({}, {sort: {createdAt: -1}});
    },
    totalExpenses: function() {
      var sum = 0;
      var cursor = Expenses.find({});
      cursor.forEach(function(transaction){
       sum = sum + transaction.amount
     });
     return sum;
    },
    dateBeautifier: function(date) {
      if (date) {
        if (moment(date).isSame(moment(), 'day')) {
          return moment(date).fromNow();
        } else {
          return moment(date).format('DD.MM.YYYY');
        }
      }
    },
    displayOwner: function(owner) {
      var user = Meteor.users.findOne(owner);
      if (user && user.username) {
        return user.username;
      }
    },
    isOwner: function() {
      return this.owner === Meteor.userId();
    },
    parseNumbers: function(data) {
      return parseFloat(Math.round(data * 100) / 100).toFixed(2);
    }
  });

  Template.showExpenses.events({
    "click #deleteExpense": function() {
      Meteor.call("deleteExpense", this._id);
    }
  });

  Template.charts.onRendered(function() {
    var pieData = {};
    Categories.find().fetch().forEach(function(transaction){
      var c = transaction.name;
      // using userderscore.js functions
      var total = _.reduce(_.map(Expenses.find({categories: transaction._id}).fetch(),
        function(doc) {
          //map
          return doc.amount
        }),
        function(memo, num){
          //reduce
          return memo + num;
      });
      pieData[c] = total;
    });

    var data = {
      // A labels array that can contain any sort of values
      labels: _.keys(pieData),
      // Our series array that contains series objects or in this case series data arrays
      series: _.values(pieData)
    };
    new Chartist.Pie('.ct-chart', data);
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // create initial categories
    if (Categories.find().count() == 0) {
        Categories.insert({name:'Sonstige'}, {validate: false});
        Categories.insert({name:'Mittagessen'}, {validate: false});
        Categories.insert({name:'Snack'}, {validate: false});
        Categories.insert({name:'Einkauf'}, {validate: false});
        Categories.insert({name:'Markt'}, {validate: false});
      }

    //create initial user
    if ( Meteor.users.find().count() == 0 ) {
      Accounts.createUser({
        username: 'michi',
        password: 'password'
      });
    }
  });

  Meteor.publish("allExpenses", function() {
    // only show entires, if a user is logged in
    if (!this.userId) {
      this.ready();
      return;
    }
    return Expenses.find();
  });

  Meteor.publish("allCategories", function() {
    // only show entires, if a user is logged in
    if (!this.userId) {
      this.ready();
      return;
    }
    return Categories.find();
  });

  Meteor.publish('allUsers', function() {
    // only show entires, if a user is logged in
    if (!this.userId) {
      this.ready();
      return;
    }
    return Meteor.users.find();
  });

  Meteor.methods({
    deleteExpense: function (expenseId) {
      var expense = Expenses.findOne(expenseId);
      if (expense.owner !== Meteor.userId()) {
        // If the task is private, make sure only the owner can delete it
        throw new Meteor.Error("not-authorized");
      }
      Expenses.remove(expenseId);
    }
  });

}
