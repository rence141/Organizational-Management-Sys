// controllers/userController.js

// Create User
exports.createUser = (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required.' });
  }

  // Generate next id
  const newId = req.store.users.length > 0
    ? req.store.users[req.store.users.length - 1].id + 1
    : 1;

  // Create new user
  const newUser = { id: newId, name, email };
  req.store.users.push(newUser);

  return res.status(201).json({ message: 'User created', user: newUser });
};

// Get All Users
exports.getUsers = (req, res) => {
  return res.status(200).json(req.store.users);
};

// Get User by ID
exports.getUserById = (req, res) => {
  const id = Number(req.params.id);
  const user = req.store.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json(user);
};

// Update User
exports.updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body || {};

  const userIndex = req.store.users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  if (name) req.store.users[userIndex].name = name;
  if (email) req.store.users[userIndex].email = email;

  return res.status(200).json({ message: 'User updated', user: req.store.users[userIndex] });
};

// Delete User
exports.deleteUser = (req, res) => {
  const id = Number(req.params.id);

  const userIndex = req.store.users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  req.store.users.splice(userIndex, 1);

  return res.status(200).json({ message: 'User deleted' });
};
