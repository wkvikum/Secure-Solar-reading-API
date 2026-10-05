const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const apiRouter = require('./src/routes');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', session: 'NB6007CEM S2' });
});

// All resource endpoints are namespaced under /api
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});