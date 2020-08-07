import React from 'react';
import './Top.css';

export default class Field extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            partnerID: null
        }
    }

    componentDidMount() {
        var xhr = new XMLHttpRequest();
        var url = process.env.REACT_APP_API_URL + '/api/getID'
        xhr.open("GET", url, true);
        xhr.withCredentials = true;
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var json_obj = JSON.parse(xhr.responseText);
                    this.setState({ id: json_obj["id"] });
                } else {
                    console.error(xhr.statusText);
                }
            }
        }.bind(this);
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
        };
        xhr.send(null);
    }

    handleChange(event) {
        this.setState({ partnerID: event.target.value })
    }

    handleSubmit(e) {
        e.preventDefault()
        console.log()
        var xhr = new XMLHttpRequest();
        var url = process.env.REACT_APP_API_URL + '/api/setPartnerID'
        xhr.open("POST", url, true);
        xhr.withCredentials = true;
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("Partner ID set")
                } else {
                    console.error(xhr.statusText);
                }
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
        };
        xhr.send(this.state.partnerID);
    }

    render() {
        return (
            <div id="top">
                {'Your ID: '}
                <div id="id">{this.state.id ? this.state.id : "     "}</div>
                {'  '}
                {'Partner ID: '}
                <form id="form" onSubmit={this.handleSubmit.bind(this)}>
                    <input id="inp" type="text" maxlength="5" onChange={this.handleChange.bind(this)}></input>
                </form>
            </div>
        )
    }
}