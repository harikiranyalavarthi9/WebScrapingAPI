import React from 'react';
import { Table } from 'antd';
class TableData extends React.Component {
    render() {
        return (
            <div>
                <Table columns={this.props.ColumnData} dataSource={this.props.ResultData} bordered scroll={{ x: 'calc(700px + 50%)', y: 270 }} />
            </div>
        );
    }
}

export default TableData;
