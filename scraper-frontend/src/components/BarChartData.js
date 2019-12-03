import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

class BarChartData extends React.Component {
    render() {
        let statisticString;
        if(this.props.ResultData[0] !==  undefined) {
            statisticString = Object.keys(this.props.ResultData[0])[2];
        }
        return (
            <div>
                <ResponsiveContainer width={'99%'} height={300}>
                    <BarChart data={this.props.ResultData}>
                        <XAxis dataKey="name" stroke="#8884d8" />
                        <YAxis />
                        <Tooltip />
                        <Legend width={100} wrapperStyle={{ top: 40, right: 20, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '40px' }} />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <Bar type="monotone" dataKey={statisticString} fill="#8884d8" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }
}

export default BarChartData;