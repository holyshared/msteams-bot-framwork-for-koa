var newUsers = [
  {
    user: 'bot',
    pwd: 'bot',
    roles: [
      {
        role: 'readWrite',
        db: 'bot'
      }
    ]
  }
];

var currentUsers = db.getUsers();
if (currentUsers.length === newUsers.length) {
  quit();
}
db.dropAllUsers();

for (var i = 0, length = newUsers.length; i < length; ++i) {
  db.createUser(newUsers[i]);
}
