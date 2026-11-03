const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

require('dotenv').config();

const CSV_PATH = path.join(process.cwd(), 'load-users.csv');
const API = 'http://localhost:4001/api/v1';

function buildCsv(_context, _events, done) {
  writePairs()
    .then((count) => {
      console.log(`Wrote ${count} pairs to load-users.csv`);
      done();
    })
    .catch((err) => {
      if (!err.code) err.code = 'users.build_failed';
      done(err);
    });
}

async function writePairs() {
  const secret = process.env.AUTH_JWT_ACCESS_TOKEN_SECRET_KEY;
  if (!secret) {
    throw codedError('users.missing_jwt_secret');
  }

  const db = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    dialect: 'postgres',
    logging: false,
  });

  try {
    const [users] = await db.query(
      `select id from users where email like 'lt_%@loadtest.dev' order by id asc`,
    );

    const pairs = [];
    for (let i = 0; i + 1 < users.length; i += 2) {
      pairs.push([users[i].id, users[i + 1].id]);
    }

    const lines = ['token,peerToken,conversationId'];
    for (const [senderId, peerId] of pairs) {
      const token = signToken(senderId, secret);
      const peerToken = signToken(peerId, secret);
      const conversationId = await createConversation(token, peerId);
      lines.push(`${token},${peerToken},${conversationId}`);
    }

    fs.writeFileSync(CSV_PATH, `${lines.join('\n')}\n`);
    return pairs.length;
  } finally {
    await db.close();
  }
}

function signToken(userId, secret) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: '2h' });
}

async function createConversation(token, peerId) {
  const response = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'Private',
      participant_ids: [peerId],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.data || !body.data.id) {
    throw codedError('users.conversation_failed');
  }
  return body.data.id;
}

function codedError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

module.exports = { buildCsv };
