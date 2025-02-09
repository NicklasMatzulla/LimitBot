const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: 'playunlimited.net',
    username: 'Bot',
    auth: 'microsoft',
    version: '1.21.4'
});

bot.on('spawn', () => {
    console.log("Bot ist bereit!");

    setInterval(lookAtNearestPlayer, 10);
    setInterval(mimicPlayerActions, 10);
});

const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: true });
});

bot.on('entitySwingArm', (entity) => {
    const nearestPlayer = findNearestPlayer();
    if (nearestPlayer && nearestPlayer.entity && entity === nearestPlayer.entity) {
        bot.swingArm('right');
    }
});

function shutdownBot(reason) {
    console.log(`Der Bot wurde getrennt. Grund: ${reason}`);
    process.exit(0);
}

bot.on('end', () => shutdownBot("Verbindung zum Server verloren"));
bot.on('kicked', (reason) => shutdownBot(`Vom Server gekickt: ${reason}`));
bot.on('error', (err) => shutdownBot(`Fehler aufgetreten: ${err.message}`));

function findNearestPlayer() {
    let nearestPlayer = null;
    let nearestDistance = Infinity;

    for (const playerName in bot.players) {
        const player = bot.players[playerName];
        if (!player || !player.entity || playerName === bot.username) continue;

        const distance = bot.entity.position.distanceTo(player.entity.position);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestPlayer = player;
        }
    }
    return nearestPlayer;
}

function lookAtNearestPlayer() {
    const player = findNearestPlayer();
    if (!player) return;

    const playerPosition = player.entity.position.offset(0, 1.6, 0);
    bot.lookAt(playerPosition).catch((err) => {
        console.error("Fehler beim Anschauen des Spielers:", err.message);
    });
}

function mimicPlayerActions() {
    const player = findNearestPlayer();
    if (!player || !player.entity) return;

    const sneaking = !!(player.entity.metadata[0] & 0x02);
    bot.setControlState('sneak', sneaking);
}
