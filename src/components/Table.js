import React, {useEffect, useState} from 'react';
import {Tooltip} from 'react-tooltip'


const TableComponent = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://dpg.gg/test/calendar.json');
                const jsonData = await response.json();
                const sortedData = Object.entries(jsonData);
                setData(sortedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);


    const generateTableData = () => {
        const tableData = [];
        let currentDate = new Date();
        let currentDayOfWeek = currentDate.getDay();


        currentDayOfWeek = (currentDayOfWeek + 6) % 7;

        for (let i = 0; i < 51; i++) {
            const column = new Array(7).fill({});

            for (let j = currentDayOfWeek; j >= 0; j--) {
                const formattedDate = currentDate.toISOString().split('T')[0];
                const contribution = data.find(([date]) => date === formattedDate);
                const contributionCount = contribution ? contribution[1] : 0;

                column[j] = {
                    date: formattedDate,
                    count: contributionCount,
                };

                currentDate.setDate(currentDate.getDate() - 1);
            }
            currentDayOfWeek = 6;
            tableData.push(column);
        }

        return tableData.reverse();
    };

    const getBackgroundColor = (count) => {
        if (count > 30) {
            return '#254E77';
        } else if (count >= 20) {
            return '#527BA0';
        } else if (count >= 10) {
            return '#7FA8C9';
        } else if (count >= 1) {
            return '#ACD5F2';
        } else {
            return '#EDEDED';
        }
    };

    const calculateMonthSpan = () => {
        const spanData = {};
        tableData.forEach((week) => {
            const month = week[0].date.slice(0, 7);
            if (!spanData[month]) {
                spanData[month] = 0;
            }
            spanData[month]++;
        });
        return spanData;
    };

    const monthNamesInRussian = {
        '01': 'Янв.',
        '02': 'Февр.',
        '03': 'Март',
        '04': 'Апр.',
        '05': 'Май',
        '06': 'Июнь',
        '07': 'Июль',
        '08': 'Авг.',
        '09': 'Сент.',
        '10': 'Окт.',
        '11': 'Нояб.',
        '12': 'Дек.',
    };


    const capitalize = (s) => {
        if (typeof s !== 'string') return '';
        return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getRussianDate = (dateString) => {
        if (dateString) {
            const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
            const date = new Date(dateString);
            let formattedDate = new Intl.DateTimeFormat('ru-RU', options).format(date);
            formattedDate = formattedDate.replace(' г.', '');
            return capitalize(formattedDate);
        } else {
            return "";
        }
    };

    const tableData = generateTableData();
    const monthSpan = calculateMonthSpan();


    return (
        <div className='container'>
            <table style={{borderSpacing: '4px'}}>
                <thead>
                <tr>
                    <th></th>
                    {Object.keys(monthSpan).map((month) => (
                        <th
                            key={month}
                            colSpan={monthSpan[month]}
                            style={{textAlign: 'center'}}
                        >
                            {monthNamesInRussian[month.slice(-2)]}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {['Пн ', ' ', 'Ср ', ' ', 'Пт', ' ', ' '].map((day, rowIndex) => (
                    <tr key={day + rowIndex}>
                        <td style={{ width: '25px', textAlign: 'center' }}>{day}</td>
                        {tableData.map((column, colIndex) => {
                            const date = column[rowIndex].date;
                            const count = column[rowIndex].count;
                            const backgroundColor = getBackgroundColor(count);
                            return (
                                <td
                                    data-tooltip-id={column[rowIndex].date}
                                    key={`${colIndex}-${rowIndex}`}
                                    title={column[rowIndex].date}
                                    style={{
                                        backgroundColor,
                                        minWidth: '15px',
                                        width: '15px',
                                        height: '15px',
                                        lineHeight: '15px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Tooltip render={() => (
                                        <span>
        {count === 0 ? 'No contributions' : `${count} contributions`}
                                            <br/>
                                            {date && getRussianDate(date)}
    </span>
                                    )} openOnClick={true} id={column[rowIndex].date}/>
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableComponent;
