const { io } = require('socket.io-client');
const { randomUUID } = require('crypto');

const CONNECT_TIMEOUT_MS = 10_000;
const DELIVERY_TIMEOUT_MS = 5_000;

function hitMessages(context, events, done) {
  const state = { sender: null, peer: null };

  sendRealMessages(context, events, state)
    .then(() => done())
    .catch((err) => {
      if (!err.code) {
        err.code = 'message.failed';
      }
      done(err);
    })
    .finally(() => {
      closeSocket(state.sender);
      closeSocket(state.peer);
    });
}

async function sendRealMessages(context, events, state) {
  const token = context.vars.token;
  const peerToken = context.vars.peerToken;
  const conversationId = Number(context.vars.conversationId);
  const messagesPerUser = Number(context.vars.messagesPerUser) || 4;
  const target = context.vars.target;

  if (!token || !peerToken || !Number.isInteger(conversationId)) {
    throw codedError('payload.missing_fields');
  }

  const [sender, peer] = await Promise.all([
    connectSocket(target, token).then((socket) => {
      state.sender = socket;
      return socket;
    }),
    connectSocket(target, peerToken).then((socket) => {
      state.peer = socket;
      return socket;
    }),
  ]);

  events.emit('counter', 'sockets.connected', 2);

  for (let i = 0; i < messagesPerUser; i++) {
    const content = `lt-${conversationId}-${i}-${randomUUID()}`;
    const started = Date.now();
    const delivery = waitForDelivery(peer, conversationId, content);

    try {
      // send-message returns nothing, so Nest never calls the ack callback.
      // A hit is the other participant receiving on-message-received.
      sender.emit('send-message', {
        conversation_id: conversationId,
        content,
        type: 'Text',
      });
      events.emit('counter', 'messages.sent', 1);

      await delivery.promise;
      events.emit('histogram', 'message.e2e_ms', Date.now() - started);
      events.emit('counter', 'messages.delivered', 1);
    } finally {
      delivery.cancel();
    }
  }
}

function connectSocket(url, token) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const socket = io(url, {
      transports: ['websocket'],
      extraHeaders: { token },
      reconnection: false,
      forceNew: true,
      multiplex: false,
      timeout: CONNECT_TIMEOUT_MS,
    });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      socket.close();
      reject(codedError('socket.connect_timeout'));
    }, CONNECT_TIMEOUT_MS);

    socket.once('connect', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(socket);
    });

    socket.once('connect_error', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.close();
      reject(codedError('socket.connect_failed'));
    });
  });
}

function waitForDelivery(socket, conversationId, content) {
  let onMessage;
  let timer;
  let settled = false;

  const promise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      socket.off('on-message-received', onMessage);
      reject(codedError('message.delivery_timeout'));
    }, DELIVERY_TIMEOUT_MS);

    onMessage = (message) => {
      if (!message || Number(message.conversation_id) !== conversationId) return;
      if (message.content !== content) return;
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.off('on-message-received', onMessage);
      resolve(message);
    };

    socket.on('on-message-received', onMessage);
  });

  return {
    promise,
    cancel() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.off('on-message-received', onMessage);
    },
  };
}

function closeSocket(socket) {
  if (socket) socket.close();
}

function codedError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

module.exports = { hitMessages };
