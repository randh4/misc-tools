const express = require('express');
const path = require('path');
const indexRoutes = require('./routes/index.routes');
const toolsRoutes = require('./routes/tools.routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);
app.use('/tools', toolsRoutes);

app.use((req, res) => {
  res.status(404).render('pages/home', {
    title: '404 - Not Found',
    tools: Object.values(require('./config/tools.registry')),
    error: 'Halaman atau tool tidak ditemukan.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
