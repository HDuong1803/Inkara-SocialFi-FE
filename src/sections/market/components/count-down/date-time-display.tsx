import React from 'react';

const DateTimeDisplay = ({ value} : {value: number}) => {
return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '16px' }}>{value}</span>
    </div>
);
};

export default DateTimeDisplay;