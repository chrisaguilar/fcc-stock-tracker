import randomcolor from 'randomcolor';
import * as React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export class Chart extends React.Component<any, any> {
    // tslint:disable:member-ordering
    public shouldComponentUpdate (nextProps: any, nextState: any): boolean {
        if (nextProps.symbols.length !== this.props.symbols.length) return true;
        else return false;
    }

    public render (): JSX.Element {
        return (
            <ResponsiveContainer width='100%' height={800}>
                <LineChart data={this.props.chartData} margin={{ top: 5, right: 25, left: 25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' interval={730} />
                    <YAxis domain={[0, 1500]} />
                    <Tooltip />
                    <Legend verticalAlign='top' align='center'/>
                    {this.props.symbols.map((symbol: any) => (
                        <Line dot={false} key={symbol} dataKey={symbol} stroke={randomcolor()} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    }
    // tslint:enable
}
