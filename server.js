const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});


const initDB = async () => {
    await pool.query("CREATE TABLE IF NOT EXISTS clientes (id SERIAL PRIMARY KEY, nome VARCHAR(255))");
    await pool.query("CREATE TABLE IF NOT EXISTS pedidos (id SERIAL PRIMARY KEY, cliente_id INTEGER REFERENCES clientes(id), sabor VARCHAR(255), preco DECIMAL, status VARCHAR(50))");
};
initDB();

// POST: Criar Pedido
app.post('/pedidos', async (req, res) => {
    const { nome_cliente, sabor, preco } = req.body;
    if (!nome_cliente || !sabor || !preco) return res.status(400).json({ erro: "Dados incompletos!" });

    try {
        const resultCliente = await pool.query("INSERT INTO clientes (nome) VALUES ($1) RETURNING id", [nome_cliente]);
        const cliente_id = resultCliente.rows[0].id;

        // Verificar pizza
        const contagem = await pool.query("SELECT COUNT(*) FROM pedidos WHERE status = 'Preparando'");
        const ativos = parseInt(contagem.rows[0].count);
        
        const status_inicial = ativos > 0 ? 'Em espera' : 'Preparando';

        await pool.query("INSERT INTO pedidos (cliente_id, sabor, preco, status) VALUES ($1, $2, $3, $4)", [cliente_id, sabor, preco, status_inicial]);
        res.status(201).json({ mensagem: "Pedido criado!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// GET: Listar Pedidos
app.get('/pedidos', async (req, res) => {
    const { ordenarPor } = req.query;
    let sql = "SELECT p.id, c.nome AS cliente, p.sabor, p.preco, p.status FROM pedidos p JOIN clientes c ON p.cliente_id = c.id";
    
    if (ordenarPor === 'preco') sql += " ORDER BY p.preco DESC";
    else if (ordenarPor === 'ordem') sql += " ORDER BY p.id ASC";

    try {
        const { rows } = await pool.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PATCH: Atualizar Status e Puxar Fila Automática
app.patch('/pedidos/:id/status', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        await pool.query("UPDATE pedidos SET status = $1 WHERE id = $2", [status, id]);

        // Se a pizza liberou a cozinha, puxa a próxima
        if (status === 'Saiu para entrega') {
            const sqlFila = `
                UPDATE pedidos 
                SET status = 'Preparando' 
                WHERE id = (
                    SELECT id FROM pedidos 
                    WHERE status = 'Em espera' 
                    ORDER BY id ASC 
                    LIMIT 1
                )
            `;
            await pool.query(sqlFila);
        }
        
        res.json({ mensagem: "Status atualizado!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE: Cancelar o Pedido
app.delete('/pedidos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM pedidos WHERE id = $1", [id]);

        
        const contagem = await pool.query("SELECT COUNT(*) FROM pedidos WHERE status = 'Preparando'");
        const ativos = parseInt(contagem.rows[0].count);

        if (ativos === 0) {
            const sqlFila = `
                UPDATE pedidos 
                SET status = 'Preparando' 
                WHERE id = (
                    SELECT id FROM pedidos 
                    WHERE status = 'Em espera' 
                    ORDER BY id ASC 
                    LIMIT 1
                )
            `;
            await pool.query(sqlFila);
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Exportação Vercel Serverless
module.exports = app;
