export const aggregateDataByCategory = (data) => {
    const categoryTotals = data.reduce((acc, item) => {
        const category = item['大項目'];
        const amount = item['金額（円）'];
        if (acc[category]) {
            acc[category] += amount;
        } else {
            acc[category] = amount;
        }
        return acc;
    }, {});

    return {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#36A2EB',
                '#FFCE56'
            ],
            hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#36A2EB',
                '#FFCE56'
            ]
        }]
    };
};

export const splitDataBySign = (data) => {
    const positiveData = data.filter(item => item['金額（円）'] > 0);
    const negativeData = data.filter(item => item['金額（円）'] < 0);

    const positiveTotal = positiveData.reduce((acc, item) => acc + item['金額（円）'], 0);
    const negativeTotal = negativeData.reduce((acc, item) => acc + item['金額（円）'], 0);

    return {
        positiveData: aggregateDataByCategory(positiveData),
        negativeData: aggregateDataByCategory(negativeData),
        positiveTotal,
        negativeTotal
    };
};

    // テスト関数
    export const testAggregateDataByCategory = () => {
        const testData = [
            { '大項目': '食費', '金額（円）': 1000 },
            { '大項目': '交通費', '金額（円）': 500 },
            { '大項目': '食費', '金額（円）': 1500 },
            { '大項目': '娯楽', '金額（円）': 2000 },
            { '大項目': '交通費', '金額（円）': 700 },
        ];

    const expectedOutput = {
        labels: ['食費', '交通費', '娯楽'],
        datasets: [{
            data: [2500, 1200, 2000],
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#36A2EB',
                '#FFCE56'
            ],
        hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
        ]
        }]
    };

    const result = aggregateDataByCategory(testData);
    console.log('Test Result:', result);
    console.log('Expected Output:', expectedOutput);
    console.assert(JSON.stringify(result) === JSON.stringify(expectedOutput), 'Test failed');
    console.log('Test passed');
};
