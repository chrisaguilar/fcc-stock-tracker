import * as React from 'react';

import { RemoveSymbol } from '$RemoveSymbol';

import * as styles from './Symbols.scss';

export const Symbols: (props: any) => JSX.Element = (props: any): JSX.Element => (
    <ul className={styles.symbolMain}>
        {props.symbols.map((e: string, i: number) => (
            <li className={styles.symbolItem} key={i}>
                {e}
                <RemoveSymbol symbol={e} removeSymbol={props.removeSymbol} />
            </li>
        ))}
    </ul>
);
