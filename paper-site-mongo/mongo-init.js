db.createUser(
    {
      user: "devuser",
      pwd:  "PapErSiTe1996",
      roles: [ { role: "readWrite", db: "paperDev" } ],
      mechanisms:["SCRAM-SHA-1"]
    }
  );