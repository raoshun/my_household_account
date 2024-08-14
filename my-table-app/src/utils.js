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
