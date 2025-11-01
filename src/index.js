const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const usersFile = path.join(__dirname, 'data', 'users.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static assets
app.use(express.static(path.join(__dirname, '..', 'static')));
app.use(express.static(path.join(__dirname, '..', 'templates')));
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// helper to read/write users
function readUsers() {
  try {
    const raw = fs.readFileSync(usersFile, 'utf8') || '[]';
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// register
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  const users = readUsers();
  if (users.find(u => u.email === email)) { // verifica se o email já existe
    return res.status(400).json({ error: 'Email já cadastrado!' });
  }

  users.push({ username, email, password }); // armazena todos os campos
  writeUsers(users);
  return res.json({ message: 'Usuário cadastrado com sucesso!' });
});


// login
// login usando email
app.post('/login', (req, res) => {
  const { email, password } = req.body; // receber email
  const users = readUsers();

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ error: 'Email ou senha inválidos!' });

  return res.json({ message: `Bem-vindo, ${user.username}!` }); // exibe nome do usuário
});

// default routes to open pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'templates', 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'templates', 'login.html')));
app.get('/cadastro.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'templates', 'cadastro.html')));

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

// reset de senha
app.post('/reset-password', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Email não encontrado!' });
  }

  users[userIndex].password = password; // Atualiza a senha
  writeUsers(users);

  return res.json({ message: 'Senha redefinida com sucesso!' });
});
