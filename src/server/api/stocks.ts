import axios from 'axios';
import express from 'express';

const stocks: express.Router = express.Router();

stocks.get('/:symbol', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { data }: any = await axios({
            method: 'get',
            baseURL: 'https://www.alphavantage.co/query',
            params: {
                apikey: process.env.ALPHA_VANTAGE_API_KEY,
                function: 'TIME_SERIES_DAILY',
                outputsize: 'full',
                symbol: req.params.symbol
            }
        });

        res.json(data);
    } catch (e) {
        next(e);
    }
});

export { stocks };
