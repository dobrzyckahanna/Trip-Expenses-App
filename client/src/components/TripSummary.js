import React, { Component } from 'react'; 
import axios from 'axios';
import ContentWrapper from './ContentWrapper';
import Chart from 'chart.js';

class TripSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tripId: "5e0dd4fa618f3e1f10d4db80", // temporary 
      expenseId: "5e0e0ffd4f0e0f24a0e1ec1b", // temporary 
      budgetAmount: "",
      budgetCurrency: "",
      spentAmountinMainCurrency: "",
      tripCurrenciesWithRatesToMainCurrency: [
        { name: 'USD', rate: 3 },
        { name: 'EUR', rate: 2 },
        { name: 'GBP', rate: 4 },
        { name: 'JPY', rate: 7 },
        { name: 'AUD', rate: 5 },
        { name: 'CAD', rate: 8 },
        { name: 'CHF', rate: 9 },
        { name: 'PLN', rate: 1 }
      ],
      tripCategories: [],
      totalExpensesByCategory: [  //hardcoded
        {
          name: "transport", 
          amount: 20, 
          currency: "PLN"
        },
        {
          name: "food", 
          amount: 30, 
          currency: "PLN"
        },
        {
          name: "tickets", 
          amount: 50, 
          currency: "PLN"
        },
        {
          name: "other", 
          amount: 10, 
          currency: "PLN"
        },
        {
          name: "accomodation", 
          amount: 200, 
          currency: "PLN"
        },
      ]
    }
  }

  getDataFromExpense = async () => {
    const res = await axios.get(`http://localhost:3000/api/trips/${this.state.tripId}`);
    try {
      const expensesArray = [];
      const sumArray = [];
      res.data.expenses.forEach(expense => {
        expensesArray.push({ id: expense._id, cost: expense.cost, currency: expense.currency } )
      });
      this.state.tripCurrenciesWithRatesToMainCurrency.forEach(element => {
        for(let i = 0; i < expensesArray.length; i++) {
          if (element.name === expensesArray[i].currency) {
            sumArray.push(expensesArray[i].cost * element.rate);
          } else continue;
        }
      });
      const finalAmount = sumArray.reduce((x, y) => x + y, 0) 

      this.setState({
        spentAmountinMainCurrency: finalAmount,
        tripCategories: res.data.categories
      });

    } catch (error) {
      this.setState({ error: 'Error' });
    }

  }
  
  getDataFromTrip = async () => {
    const res = await axios.get(`http://localhost:3000/api/trips/${this.state.tripId}`);
    try {
      this.setState({
        budgetAmount: res.data.budget,
        budgetCurrency: res.data.mainCurrency,
        spentAmountinMainCurrency: 7 // calculate
      });
    } catch (error) {
      this.setState({ error: 'Error' });
    }
  }

  createChart = () => {
    const ctx = document.getElementById('budgetChart');

    const arrayAllColors = ["#fad390", "#6a89cc","#82ccdd","#b8e994","#e55039", "#4a69bd", "#3c6382", "#3c6382", "#e58e26", "#78e08f"];
    const arrayRandomColors = [];
    this.state.tripCategories.forEach(element => {
      const randomColor = arrayAllColors[Math.floor(Math.random() * arrayAllColors.length)]; 
      if (arrayRandomColors.includes(randomColor)) {
        return; // wrong - should be corrected to avoid repeating colors
      } else {
        arrayRandomColors.push(randomColor);
      }}
    );

    const arrayAmounts = [];
    const arrayCategories = [];
    this.state.totalExpensesByCategory.forEach (element => {
      arrayAmounts.push(element.amount);
      arrayCategories.push(element.name);
    });

    const budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: arrayCategories, 
        datasets: [
          {
            label: "Cost amount",
            backgroundColor: arrayRandomColors, 
            data: arrayAmounts
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Expenses by category:'
        }
      }
    });
  }
  
  componentDidMount = async () => { // not sure if this is correct approach - long loading, spinner needed?
    await this.getDataFromTrip();
    await this.getDataFromExpense();
    await this.createChart();
  }

  render() {
    return (
      <>
        <p>{this.state.tripName}</p>  
        <ContentWrapper title="Summary">

          <div>Budget: {this.state.budgetAmount} {this.state.budgetCurrency} </div>
          <div>Spent: {this.state.spentAmountinMainCurrency} {this.state.budgetCurrency}</div>
          <div>Left: {this.state.budgetAmount - this.state.spentAmountinMainCurrency} {this.state.budgetCurrency}</div>

          <ul>
            { this.state.totalExpensesByCategory.map((data, i) => {
                return (
                  <li key={i}>{data.name + ": " + data.amount + " " + data.currency}</li>
                );
              })
            }
         </ul>

          <canvas id="budgetChart" width="400" height="400"></canvas>

        </ContentWrapper>
      </>
    )
  }
}

export default TripSummary;