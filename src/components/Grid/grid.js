import React, { Component } from 'react';
import './grid.css';
import dateFNS from 'date-fns';
import { Tooltip, OverlayTrigger, Navbar, Button } from 'react-bootstrap';
import HotelBookingForm from '../HotelBookingForm/HotelBookingForm';
import axios from 'axios';

class Grid extends Component {
    state = {
        showModal: false,
        items: [],
        rooms: [],
        monthlyBooking: {},
        loading: true,
        detailsForForm: {}
    }

    getRandomColor = () => {
        var lum = -0.25;
        var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var rgb = "#",
            c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }

    componentDidMount() {
        const date = new Date();
        const monthNumber = dateFNS.getMonth(date);
        const year = dateFNS.getYear(date);
        const numberOfDays = dateFNS.getDaysInMonth(new Date(year, monthNumber));

        const monthlyBookingObj = {
            monthNumber,
            year,
            numberOfDays,
            bookingId: 12345
        }

        this.setState({ monthlyBooking: monthlyBookingObj });
        this.getRooms(monthlyBookingObj)
    }

    getRooms = (monthlyBookingObj) => {
        axios.get('/getRooms')
            .then(res => {
                this.setState({ rooms: res.data });

                const tempArray = new Array(this.state.rooms.length);
                this.finalArray(tempArray, monthlyBookingObj);
                this.getMonthObj({ year: monthlyBookingObj.year, monthNumber: monthlyBookingObj.monthNumber });
            }).catch(error => console.log(error));
    }

    getMonthObj = (monthObj) => {
        axios.post('/checkForMonthObj', monthObj)
            .then(res => {
                console.log(res.data);
                if (res.status === 200) {
                    this.bookRoom(res.data[0]);
                    this.setState({ loading: false });
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({ loading: false })
            })
    }

    finalArray = (tempArray, monthlyBooking) => {
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i] = new Array(monthlyBooking.numberOfDays).fill({ roomNumber: this.state.rooms[i].roomNumber, available: true });
            tempArray[i].unshift({ showRoomNumber: this.state.rooms[i].roomNumber });
        }

        this.setState({ items: tempArray, monthlyBooking });
    }

    renderShortName = (name) => {
        const shortName = name.split(' ');
        return shortName[0].charAt(0) + shortName[1].charAt(0);
    }

    setClassForCell = (subitemIndex) => {
        let date = dateFNS.getDate(new Date());
        let month = dateFNS.getMonth(new Date());
        return subitemIndex < date && month === this.state.monthlyBooking.monthNumber ? 'template_subitem noselect pointerCursor disable-cell' : 'template_subitem noselect pointerCursor';
    }

    tooltipPlacement = (itemIndex) => {
        return itemIndex === 0 || itemIndex === 1 ? 'bottom' : 'top';
    }

    renderItems = () => {
        return this.state.items.map((item, itemIndex) =>
            <div className="template_item" key={'item' + itemIndex}>
                {item.map((subitem, subitemIndex) =>
                    subitem.showBooking ?
                        <OverlayTrigger placement={this.tooltipPlacement(itemIndex)} key={'subitem' + subitemIndex}
                            overlay={<Tooltip id={`tooltip-${this.tooltipPlacement(itemIndex)}`}>{subitem.name}</Tooltip>}>
                            <div className={this.setClassForCell(subitemIndex)} style={{ color: subitem.color, background: 'rgb(240,255,255)', fontWeight: 'bold' }} onClick={() => this.showModalHandler(subitem, subitemIndex)}>{this.renderShortName(subitem.name)}</div>
                        </OverlayTrigger> :
                        subitem.showRoomNumber ?
                            <div className="template_subitem noselect importantCells" key={'subitem' + subitemIndex}>{subitem.showRoomNumber}</div>
                            : <div key={'subitem' + subitemIndex} className={this.setClassForCell(subitemIndex)} onClick={() => this.showModalHandler(subitem, subitemIndex)}>
                                <div className="template_subitem_showOnHover">{subitem.roomNumber}</div>
                            </div>
                )}
            </div>
        )
    }

    booking = (bookObj, color) => {
        const tempArray = [...this.state.items];
        const find = tempArray.find(item => item[0].showRoomNumber === bookObj.roomNumber);

        if (find) {
            bookObj.dates.forEach(date => {
                let dateNumber = dateFNS.getDate(date);
                find[dateNumber] = { ...find[dateNumber], bookingId: bookObj.bookingId, showBooking: true, name: bookObj.personName, color, available: false };
            });
        }
        this.setState({ items: tempArray });
    }

    bookRoom = (monthObj) => {
        monthObj.bookingArray.forEach(item => {
            const color = this.getRandomColor();
            this.booking(item, color);
        })
    }

    changeMonth = (value) => {
        this.setState({ loading: true });
        const monthlyBooking = { ...this.state.monthlyBooking };
        const numberOfDays = dateFNS.getDaysInMonth(new Date(monthlyBooking.year, monthlyBooking.monthNumber + value));
        monthlyBooking.monthNumber = monthlyBooking.monthNumber + value;

        monthlyBooking.numberOfDays = numberOfDays;

        monthlyBooking.bookingId = monthlyBooking.bookingId + value;

        if (monthlyBooking.monthNumber > 11) {
            monthlyBooking.monthNumber = 0;
        } else if (monthlyBooking.monthNumber < 0) {
            monthlyBooking.monthNumber = 11;
        }

        if (value === 1 && monthlyBooking.monthNumber === 0) {
            monthlyBooking.year = monthlyBooking.year + 1;
        } else if (value === -1 && monthlyBooking.monthNumber === 11) {
            monthlyBooking.year = monthlyBooking.year - 1;
        }

        this.setState({ monthlyBooking });

        const tempArray = new Array(this.state.rooms.length);
        this.finalArray(tempArray, monthlyBooking);

        this.getMonthObj({ year: monthlyBooking.year, monthNumber: monthlyBooking.monthNumber });
    }

    getNameOfMonth = () => {
        return dateFNS.format(new Date(this.state.monthlyBooking.year, this.state.monthlyBooking.monthNumber), 'MMMM').toUpperCase();
    }

    showModalHandler = (subitem, dayOfMonth) => {
        const monthlyBooking = this.state.monthlyBooking;
        subitem.date = new Date(monthlyBooking.year, monthlyBooking.monthNumber, dayOfMonth);
        this.setState({ detailsForForm: subitem, showModal: true });
    }

    closeModalHandler = () => {
        this.setState({ showModal: false });
    }

    renderOverlay = () => {
        return (this.state.loading ?
            <div className="template_overlay">
                <div className="template_overlay__container">
                    <div className="spinner-border text-light" role="status"></div>
                </div>
            </div>
            : null)
    }

    setClassForNavigatingMonth = () => {
        let month = dateFNS.getMonth(new Date());
        return month === this.state.monthlyBooking.monthNumber ? "fa fa-chevron-left disableMonthNav" : "fa fa-chevron-left pointerCursor";
    }

    handleBookings = () => {
        this.getRooms(this.state.monthlyBooking);
    }

    modalStatus = () => {
        return this.state.detailsForForm.available ? 'newBooking' : 'viewBooking';
    }

    render() {
        let newRow = [];
        if (this.state.monthlyBooking.numberOfDays) {
            newRow = new Array(this.state.monthlyBooking.numberOfDays + 1);
            for (let i = 0; i < newRow.length; i++) {
                if (i !== 0) { newRow[i] = { date: i } } else { newRow[i] = {} }
            }
        }

        return (
            <div className="template_container">
                {this.renderOverlay()}
                {this.state.monthlyBooking.year ? <div style={{ height: '100%' }}>
                    <Navbar bg='light' className="app__navbar">
                        <i className={this.setClassForNavigatingMonth()} onClick={() => this.changeMonth(-1)}></i>
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{this.getNameOfMonth()} {this.state.monthlyBooking.year}</div>
                        <i className="fa fa-chevron-right pointerCursor" onClick={() => this.changeMonth(1)}></i>
                    </Navbar>
                    <div className="template_item noselect">{newRow.map((subitem, index) =>
                        <div key={`app__${subitem.date}`} className="template_subitem importantCells">
                            {subitem.date < 10 ? '0' + subitem.date : subitem.date}
                        </div>)}
                    </div>
                    <div className="template_item__container">{this.renderItems()}</div>

                    {this.state.showModal ? <HotelBookingForm
                        detailsForForm={this.state.detailsForForm}
                        showModal={this.state.showModal}
                        onClose={this.closeModalHandler}
                        handleBookings={this.handleBookings}
                        status={this.modalStatus()}>
                    </HotelBookingForm> : null}
                </div> : null}
            </div>
        )
    }
}

export default Grid;