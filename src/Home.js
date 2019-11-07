import React, { Component } from 'react';
import { Container, Col, Row, Button, Card, CardBody, Form, FormGroup, Label, Input, Tooltip } from 'reactstrap';
import currNames from './currency-name.json';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initVal: 10.0000,
      base: 'USD',
      rows: [],
      listCurrency: Object.keys(currNames),
      exchangeRates: '',
      currency: '',
      formOpen: false,
      cardOpen: false,
      formInitVal: 0,
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    fetch('https://api.exchangeratesapi.io/latest?base='+this.state.base, {method: 'GET'})
    .then(response => response.json())
    .then(result => {
      if (result.rates) {
        this.setState({exchangeRates:result.rates});
      }
    })
    .catch(err => {console.log(err);});
  }

  getCurrencyString = (val) => {
    const valString = val < 1000 ? val.toFixed(4).toString() : val.toFixed(2).toString();
    var nums = valString.split('.');
    var intArr = nums[0].split('');
    
    if (intArr.length>3) {
      let pos = 0;
      for (var i=1; i<=Math.floor(intArr.length/3); i++) {
        pos -= 3;
        if (intArr.length+pos>0) {
          intArr.splice(pos,0,',');
          pos -= 1;
        }
      }
      nums[0] = intArr.join('');
    }

    return nums.join('.');
  }

  handleFormChange = (e) => {
    this.setState({currency:e.target.value});
  }

  toggleForm = () => {
    this.setState({formOpen: !this.state.formOpen});
  }

  handleFormSubmit = (e) => {
    if (this.state.currency !== '') {
      var rows = [...this.state.rows, this.state.currency];
  
      this.setState({rows, currency:''}, this.toggleForm);
    }
  }

  removeRow = (idx) => {
    var rows = this.state.rows;

    rows.splice(idx,1);

    this.setState({rows});
  }

  toggleCard = () => {
    this.setState({cardOpen: !this.state.cardOpen, formInitVal: this.state.initVal});
  }

  handleInitValueChange = (e) => {
    this.setState({formInitVal: parseFloat(e.target.value)});
  }

  handleInitValueSubmit = (e) => {
    this.setState({initVal: this.state.formInitVal}, this.toggleCard);
  }

  toggleTooltip = () => {
    this.setState({tooltipOpen: !this.state.tooltipOpen});
  }

  render() {
    return(
      this.state.exchangeRates !== ''
      ?
      <Container>
        <Row className="justify-content-center">
          <Col md={6} className="border my-5">
            <Row className="border-bottom">
              <Col className="my-3">
                <div><i>{this.state.base} - {currNames[this.state.base]}</i></div>
                <div>
                  <h4>{this.state.base} 
                    <span id="initVal" className="float-right" onClick={this.toggleCard} >{this.getCurrencyString(this.state.initVal)}</span>
                    <Tooltip target="initVal" isOpen={this.state.tooltipOpen} toggle={this.toggleTooltip} placement="bottom">Click to edit value!</Tooltip>
                  </h4>
                </div>
              </Col>
            </Row>
            <Row>
              <Col className="my-3">
                {
                  this.state.rows.map((row, idx) => {
                    return(
                      <Row key={idx}>
                        <Col className="border mb-3 mx-3">
                          <Row>
                            <Col className="border-right py-3">
                              <div>
                                <h4>{row} <span className="float-right">{this.getCurrencyString(this.state.initVal*this.state.exchangeRates[row])}</span></h4>
                              </div>
                              <div><i>{row} - {currNames[row]}</i></div>
                              <div><i>1 {this.state.base} = {row} {this.getCurrencyString(this.state.exchangeRates[row])}</i></div>
                            </Col>
                            <Col xs={2} className="text-center pt-5" style={{cursor:'pointer'}} onClick={() => this.removeRow(idx)}>(-)</Col>
                          </Row>
                        </Col>
                      </Row>
                    );
                  })
                }
                {
                  !this.state.formOpen && this.state.rows.length+1!==this.state.listCurrency.length &&
                  <Button onClick={this.toggleForm}>(+) Add More Currencies</Button>
                }
                {
                  this.state.formOpen &&
                  <Row>
                    <Col>
                      <Form>
                        <FormGroup>
                          <Input type="select" name="currency" value={this.state.currency} onChange={this.handleFormChange}>
                            <option value="" disabled>-- select currency --</option>
                            {
                              this.state.listCurrency.map((curr, idx) => {
                                if (!this.state.rows.includes(curr) && curr!==this.state.base)
                                return(
                                  <option key={idx}>{curr}</option>
                                );
                              })
                            }
                          </Input>
                        </FormGroup>
                      </Form>
                    </Col>
                    <Col xs={2} className="pl-0">
                      <Button onClick={this.handleFormSubmit}>Submit</Button>
                    </Col>
                  </Row>
                }
              </Col>
            </Row>
          </Col>
        </Row>
        {
          this.state.cardOpen &&
          <div className="transparent-layer">
            <Card className="card-input">
              <CardBody className="text-center">
                <Form>
                  <FormGroup>
                    <Label>INITIAL VALUE</Label>
                    <Input type="number" step={0.01} min={0} value={this.state.formInitVal} onChange={this.handleInitValueChange}/>
                    <Button className="my-3 mx-1" onClick={this.handleInitValueSubmit}>Submit</Button>
                    <Button className="my-3 mx-1 border" color="default" onClick={this.toggleCard}>Cancel</Button>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </div>
        }
      </Container>
      :
      <Container className="container-loading">
        <Row className="justify-content-center">
          <Col xs={'auto'}>
            <div className="loader"></div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Home;