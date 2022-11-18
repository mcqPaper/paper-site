// Find existing user
db.getCollection('User').createIndex({ "email": 1.0 }, { name: "find existing user" })

