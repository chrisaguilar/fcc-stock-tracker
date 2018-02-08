// region IMPORTS
import { createServer, Server } from 'http';
import { join } from 'path';
import { promisify } from 'util';

import dotenv from 'dotenv';
import ejs from 'ejs';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import redis from 'redis';
import Socket from 'socket.io';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { stocks } from '~server/api';
// endregion IMPORTS

dotenv.config();

// region VARIABLES
// tslint:disable:no-unbound-method
const app: Application = express();
const client: redis.RedisClient = redis.createClient();
const config: webpack.Configuration = require('../../webpack.client.config')();
const compiler: webpack.Compiler = webpack(config);
const HDelAsync: any = promisify(client.hdel).bind(client);
const HGetAsync: any = promisify(client.hget).bind(client);
const HGetAllAsync: any = promisify(client.hgetall).bind(client);
const HSetAsync: any = promisify(client.hset).bind(client);
const server: Server = createServer(app);
const io: SocketIO.Server = Socket(server);
// tslint:enable
// endregion VARIABLES

// region EXPRESS
app.enable('trust proxy');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', join(__dirname, 'public/views'));


if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
    app.use(
        webpackDevMiddleware(compiler, {
            publicPath: (config as any).output.publicPath,
            stats: 'minimal'
        })
    );
    app.use(webpackHotMiddleware(compiler));
}

app.use('/api/stocks', stocks);
app.use('/public', express.static(join(__dirname, 'public')));
app.get('*', (req: Request, res: Response) => {
    res.render('index');
});

// endregion EXPRESS

// region SOCKET.IO
io.on('connection', (socket: SocketIO.Socket) => {
    socket.on('join', async () => {
        try {
            socket.emit('initial', await HGetAllAsync('stocks'));
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('add', async ({ data, symbol }: any) => {
        try {
            await HSetAsync('stocks', symbol, data);
            io.emit('add', { data: await HGetAsync('stocks', symbol), symbol });
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('remove', async (symbol: string) => {
        try {
            await HDelAsync('stocks', symbol);
            io.emit('remove', symbol);
        } catch (e) {
            console.error(e);
        }
    });
});
// endregion SOCKET.IO

server.listen(process.env.NODE_ENV);
