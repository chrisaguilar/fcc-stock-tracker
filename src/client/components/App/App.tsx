import axios from 'axios';
import { utc } from 'moment';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import io from 'socket.io-client';

import { Chart } from '$Chart';
import { Symbols } from '$Symbols';

let socket: SocketIOClient.Socket;

class App extends React.Component<any, any> {
    public state: any = {
        chartData: [],
        isLoading: false,
        stock: '',
        stockData: new Map(),
        symbols: []
    };

    // region USER INTERACTION
    private readonly _handleChange = (e: any): void => this.setState({ stock: e.target.value });

    private readonly _handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault();
        await this._localAdd(this.state.stock).catch((err: any) => console.error(err));
    };
    // endregion USER INTERACTION

    // region LOCAL DATA MANIPULATION
    private readonly _localAdd = async (symbol: string): Promise<void> => {
        if (this.state.stockData.has(symbol)) return;

        try {
            this.setState({ isLoading: true });
            const res: any = (await axios(`/api/stocks/${symbol}`)).data;
            const data: any = JSON.stringify(
                Object.entries(res['Time Series (Daily)']).map(([day, obj]: any) => ({
                    [day]: obj['4. close']
                }))
            );

            socket.emit('add', { data, symbol });
            this.setState({ isLoading: false, stock: '' });
        } catch (e) {
            console.error(e);
            alert('There was a problem, try again');
            this.setState({ isLoading: false });
        }
    };

    private readonly _localCreateChartData = (): void => {
        const data: any = {};
        const { stockData }: { stockData: Map<any, any> } = this.state;

        for (const [symbol, value] of stockData) {
            for (const e of JSON.parse(value)) {
                const [date, price]: any = Object.entries(e)[0];
                data[date] = data.hasOwnProperty(date)
                    ? { ...data[date], [symbol]: price }
                    : { date, [symbol]: Number(price) };
            }
        }

        const chartData: any[] = Object.values(data).sort((a: any, b: any) => utc(a.date).diff(utc(b.date)));

        this.setState({ chartData, symbols: [...this.state.stockData.keys()] });
    };

    private readonly _localRemove = (symbol: string): SocketIOClient.Socket => socket.emit('remove', symbol);
    // endregion LOCAL DATA MANIPULATION

    // region REMOTE DATA MANIPULATION
    private readonly _socketAdd = ({ data, symbol }: any): void => {
        const currentStockData: Map<any, any> = this.state.stockData;
        currentStockData.set(symbol, data);

        this.setState({ stockData: currentStockData }, this._localCreateChartData);
    };

    private readonly _socketInitial = (data: any): void =>
        this.setState({ stockData: new Map(Object.entries(data || {})) }, this._localCreateChartData);

    private readonly _socketJoin = (): SocketIOClient.Socket => socket.emit('join');

    private readonly _socketRemove = (symbol: string): void => {
        const currentStockData: Map<any, any> = this.state.stockData;
        currentStockData.delete(symbol);

        this.setState({ stockData: currentStockData }, this._localCreateChartData);
    };

    private readonly _socketSetup = (): void => {
        socket = io('localhost:8080');
        socket.on('connect', this._socketJoin);
        socket.on('initial', this._socketInitial);
        socket.on('add', this._socketAdd);
        socket.on('remove', this._socketRemove);
    };
    // endregion REMOTE DATA MANIPULATION

    // region COMPONENT LIFECYCLE
    // tslint:disable:member-ordering
    public componentDidMount (): void {
        this._socketSetup();
    }

    public render (): JSX.Element {
        return (
            <React.Fragment>
                <form onSubmit={this._handleSubmit}>
                    <input
                        disabled={this.state.isLoading}
                        id='stock-input'
                        onChange={this._handleChange}
                        placeholder='Stock Symbol'
                        type='text'
                        value={this.state.stock}
                    />
                    <input disabled={this.state.isLoading} type='submit' value='Add Symbol' />
                    {this.state.isLoading && <label htmlFor='stock-input'>Loading...</label>}
                </form>
                <Symbols removeSymbol={this._localRemove} symbols={this.state.symbols} />
                <Chart chartData={this.state.chartData} stockData={this.state.stockData} symbols={this.state.symbols} />
            </React.Fragment>
        );
    }
    // tslint:enable
    // endregion COMPONENT LIFECYCLE
}

// tslint:disable-next-line:no-default-export
export default hot(module)(App);
