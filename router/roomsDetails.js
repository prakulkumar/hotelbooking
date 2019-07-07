const express = require('express');
const cors = require('cors');

const router = new express.Router();
const dataBaseConnection = require('./dataBaseConnection');
const collections = require('../constant').collections;
const roomsArrayPromise = require('./data').roomsArrayPromise;
const monthsDetailPromise = require('./data').monthsDetailPromise;
const dateFNS = require('date-fns');

dataBaseConnection().then(dbs => {
    router.get('/getRooms', cors(), (req, res) => {
        try {
            roomsArrayPromise(dbs, collections.rooms).then(result => res.send(result));
        } catch (error) {
            console.log(error)
        }
    });

    correctMonthAndYear = (monthNumber, year) => {
        if (monthNumber > 11) {
            return { monthNumber: monthNumber - 12, year: year + 1 };
        } else {
            return { monthNumber: monthNumber, year: year };
        }
    };

    router.post('/getAvailableRooms', cors(), async (req, res) => {
        try {
            const roomsArray = await roomsArrayPromise(dbs, collections.rooms);
            let availableroomArray = [];
            let bookingArray = [];

            const diffrenceInMonth = dateFNS.differenceInCalendarMonths(req.body.departure.date, req.body.arrival.date);
            for (let index = 0; index <= diffrenceInMonth; index++) {
                const obj = correctMonthAndYear(dateFNS.getMonth(req.body.arrival.date) + index, dateFNS.getYear(req.body.arrival.date));
                let temp = await monthsDetailPromise(dbs, collections.months, obj);
                bookingArray = temp[0].bookingArray.length > 0 ? bookingArray.concat(temp[0].bookingArray) : bookingArray;
            }

            roomsArray.forEach(room => {
                let filteredArray = bookingArray.filter(bookedRoom => bookedRoom.roomNumber === room.roomNumber);
                if (filteredArray.length === 0) { availableroomArray.push(room) } else {
                    let dateArray = [], statusArray = [];
                    filteredArray.forEach(value => {
                        dateArray = dateArray.concat(value.dates);
                    });

                    dateArray.forEach(date => {
                        statusArray.push(dateFNS.isWithinRange(date, req.body.arrival.date, req.body.departure.date));
                    });

                    statusArray.includes(true) ? null : availableroomArray.push(room);
                };
            });

            res.send(availableroomArray);
        } catch (error) {
            console.log(error)
        }
    });
})

module.exports = router;