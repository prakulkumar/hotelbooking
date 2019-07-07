const express = require('express');
const cors = require('cors');

const router = new express.Router();
const collections = require('../constant').collections;
const monthsDetailPromise = require('./data').monthsDetailPromise;
const addDataPromise = require('./data').addDataPromise;
const dataBaseConnection = require('./dataBaseConnection');
const dateFNS = require('date-fns');

dataBaseConnection().then(dbs => {
    router.post('/getMonthObj', cors(), (req, res) => {
        try {
            monthsDetailPromise(dbs, collections.months, req.body).then(result => res.send(result));
        } catch (error) {
            console.log(error)
        }
    });

    router.post('/addMonthObj', cors(), (req, res) => {
        try {
            addDataPromise(dbs, collections.months, req.body).then(result => res.send(result));
        } catch (error) {
            console.log(error)
        }
    });

    router.post('/createBulkMonthObj', cors(), async (req, res) => {
        try {
            const diffrenceInMonth = dateFNS.differenceInCalendarMonths(req.body.dateOfDeparture, req.body.dateOfArrival);
            for (let index = 0; index <= diffrenceInMonth; index++) {
                const obj = correctMonthAndYear(dateFNS.getMonth(req.body.dateOfArrival) + index, dateFNS.getYear(req.body.dateOfArrival));
                await checkAndAddMonthObj(obj);
            }

            res.status(200).send('done');
        } catch (error) {
            console.log(error);
        }
    })

    correctMonthAndYear = (monthNumber, year) => {
        if (monthNumber > 11) {
            return { monthNumber: monthNumber - 12, year: year + 1 };
        } else {
            return { monthNumber: monthNumber, year: year };
        }
    };

    router.post('/checkForMonthObj', cors(), async (req, res) => {
        try {
            const result = await checkAndAddMonthObj(req.body);
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
        }
    });

    checkAndAddMonthObj = async (obj) => {
        const monthAvailable = await monthsDetailPromise(dbs, collections.months, obj);
        if (monthAvailable.length === 0) {
            let tempObj = {
                "monthName": dateFNS.format(new Date(obj.year, obj.monthNumber), 'MMMM'),
                "year": obj.year,
                "monthNumber": obj.monthNumber,
                "bookingArray": []
            };

            const result = await addDataPromise(dbs, collections.months, tempObj);
            return result.ops;
        } else if (monthAvailable.length > 0) {
            return monthAvailable;
        }
    }
})

module.exports = router;