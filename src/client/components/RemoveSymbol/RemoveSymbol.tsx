import * as React from 'react';

import * as styles from './RemoveSymbol.scss';

export class RemoveSymbol extends React.Component<any, any> {
    private readonly _remove = (): void => this.props.removeSymbol(this.props.symbol);

    public render (): JSX.Element {
        return (
            <span className={styles.symbolRemove} onClick={this._remove} role='button'>
                &times;
            </span>
        );
    }
}
