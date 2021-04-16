var incomeColor = "#4285F4";
var investmentColor = "#29AB87";
var savingsColor = '#7BA05B';
var miscColor = "#8D90A1";

var incomeCategories = {
  "Paycheck": "fas fa-money-check",
  "Bonus": "fas fa-coins",
  "Reimbursement": "fas fa-hand-holding-usd",
  "Returned Purchase": "fas fa-exchange-alt",
  "Rental Income": "fas fa-home",
  "Interest Income": "fas fa-percentage",
}

var investmentCategories = {
  "Deposit": {
    "type": "debit",
    "icon": "fas fa-sign-in-alt"
  },
  "Withdrawal": {
    "type": "credit",
    "icon": "fas fa-sign-out-alt"
  },
  "Buy": {
    "type": "debit",
    "icon": "fas fa-caret-square-up"
  },
  "Sell": {
    "type": "credit",
    "icon": "fas fa-caret-square-down"
  },
  "Dividend & Cap Gains": {
    "type": "credit",
    "icon": "fas fa-percent"
  },
}

var expenseCategories = {
  "Food & Dining": {
    "icon": "fas fa-utensils",
    "color": "#ED0A3F",
    "subcategories": {
      "Restaurants": {
        "icon": "fas fa-utensils",
      },
      "Groceries": {
        "icon": "fas fa-shopping-basket",
      },
      "Fast Food": {
        "icon": "fas fa-hamburger",
      },
      "Coffee Shops": {
        "icon": "fas fa-coffee",
      },
      "Alcohol & Bars": {
        "icon": "fas fa-glass-martini-alt",
      },
    }
  },
  "Shopping": {
    "icon": "fas fa-shopping-cart",
    "color": "#FF681F",
    "subcategories": {
      "Clothing": {
        "icon": "fas fa-tshirt",
      },
      "Electronics & Software": {
        "icon": "fas fa-laptop",
      },
      "Books": {
        "icon": "fas fa-book-open",
      },
      "Hobbies": {
        "icon": "fas fa-dice-five",
      },
      "Sporting Goods": {
        "icon": "fas fa-basketball-ball",
      },
    }
  },
  "Entertainment": {
    "icon": "fas fa-theater-masks",
    "color": "#652DC1",
    "subcategories": {
      "Movies & DVDs": {
        "icon": "fas fa-film",
      },
      "Music": {
        "icon": "fas fa-music",
      },
      "Amusement": {
        "icon": "fas fa-ticket-alt",
      },
      "Arts": {
        "icon": "fas fa-palette",
      },
      "Newspapers & Magazines": {
        "icon": "fas fa-newspaper",
      },
    }
  },
  "Bills & Utilities": {
    "icon": "fas fa-bolt",
    "color": "#FFAA1D",
    "subcategories": {
      "Home Phone": {
        "icon": "fas fa-phone",
      },
      "Mobile Phone": {
        "icon": "fas fa-mobile-alt",
      },
      "Internet": {
        "icon": "fas fa-wifi",
      },
      "Television": {
        "icon": "fas fa-tv",
      },
      "Utilities": {
        "icon": "fas fa-plug",
      },
    }
  },
  "Auto & Transport": {
    "icon": "fas fa-car-alt",
    "color": "#1560BD",
    "subcategories": {
      "Auto Payment": {
        "icon": "fas fa-car-alt",
      },
      "Auto Insurance": {
        "icon": "fas fa-car-crash",
      },
      "Gas & Fuel": {
        "icon": "fas fa-gas-pump",
      },
      "Service & Parts": {
        "icon": "fas fa-tools",
      },
      "Parking": {
        "icon": "fas fa-parking",
      },
      "Public Transportation": {
        "icon": "fas fa-bus",
      },
    }
  },
  "Home": {
    "icon": "fas fa-home",
    "color": "#3AA655",
    "subcategories": {
      "Mortgage & Rent": {
        "icon": "fas fa-key",
      },
      "Furnishings": {
        "icon": "fas fa-couch",
      },
      "Home Supplies": {
        "icon": "fas fa-toilet-paper",
      },
      "Home Insurance": {
        "icon": "fas fa-house-damage",
      },
      "Home Services": {
        "icon": "fas fa-paint-roller",
      },
      "Home Improvement": {
        "icon": "fas fa-hammer",
      },
      "Lawn & Garden": {
        "icon": "fas fa-seedling",
      },
    }
  },
  "Health & Fitness": {
    "icon": "fas fa-heartbeat",
    "color": "#FF3399",
    "subcategories": {
      "Doctor": {
        "icon": "fas fa-user-md",
      },
      "Dentist": {
        "icon": "fas fa-tooth",
      },
      "Eyecare": {
        "icon": "fas fa-eye",
      },
      "Health Insurance": {
        "icon": "fas fa-notes-medical",
      },
      "Pharmacy": {
        "icon": "fas fa-prescription-bottle",
      },
      "Gym": {
        "icon": "fas fa-dumbbell",
      },
      "Sports": {
        "icon": "fas fa-running",
      },
    }
  },
  "Personal Care": {
    "icon": "fas fa-pump-soap",
    "color": "#8F47B3",
    "subcategories": {
      "Laundry": {
        "icon": "fas fa-socks",
      },
      "Hair": {
        "icon": "fas fa-cut",
      },
      "Spa & Massage": {
        "icon": "fas fa-spa",
      },
    }
  },
  "Travel": {
    "icon": "fas fa-map-marked-alt",
    "color": "#02A4D3",
    "subcategories": {
      "Rental Car & Taxi": {
        "icon": "fas fa-taxi",
      },
      "Air Travel": {
        "icon": "fas fa-plane",
      },
      "Hotel": {
        "icon": "fas fa-concierge-bell",
      },
      "Vacation": {
        "icon": "fas fa-umbrella-beach",
      },
    }
  },
  "Education": {
    "icon": "fas fa-graduation-cap",
    "color": "#805533",
    "subcategories": {
      "Tuition": {
        "icon": "fas fa-school",
      },
      "Books & Supplies": {
        "icon": "fas fa-pencil-ruler",
      },
      "Student Loan": {
        "icon": "fas fa-hand-holding-usd",
      },
    }
  },
  "Financial": {
    "icon": "fas fa-coins",
    "color": "#5E8C31",
    "subcategories": {
      "Life Insurance": {
        "icon": "fas fa-umbrella",
      },
      "Financial Advisor": {
        "icon": "fas fa-user-tie",
      },
    }
  },
  "Business Services": {
    "icon": "fas fa-clipboard",
    "color": "#A63A79",
    "subcategories": {
      "Office Supplies": {
        "icon": "fas fa-paperclip",
      },
      "Advertising": {
        "icon": "fas fa-bullhorn",
      },
      "Printing": {
        "icon": "fas fa-print",
      },
      "Shipping": {
        "icon": "fas fa-truck",
      },
      "Legal": {
        "icon": "fas fa-balance-scale-right",
      },
    }
  },
  "Kids": {
    "icon": "fas fa-child",
    "color": "#FE4C40",
    "subcategories": {
      "Allowance": {
        "icon": "fas fa-hand-holding-usd",
      },
      "Baby Supplies": {
        "icon": "fas fa-baby",
      },
      "Babysitter & Daycare": {
        "icon": "fas fa-baby-carriage",
      },
      "Kids Activities": {
        "icon": "fas fa-birthday-cake",
      },
      "Toys": {
        "icon": "fas fa-shapes",
      },
      "Child Support": {
        "icon": "fas fa-hands-helping",
      },
    }
  },
  "Pets": {
    "icon": "fas fa-paw",
    "color": "#766EC8",
    "subcategories": {
      "Pet Food & Supplies": {
        "icon": "fas fa-bone",
      },
      "Pet Grooming": {
        "icon": "fas fa-cut",
      },
      "Veterinary": {
        "icon": "fas fa-syringe",
      },
    }
  },
  "Gifts & Donations": {
    "icon": "fas fa-ribbon",
    "color": "#C32148",
    "subcategories": {
      "Gift": {
        "icon": "fas fa-gift",
      },
      "Charity": {
        "icon": "fas fa-hand-holding-heart",
      },
    }
  },
  "Fees & Charges": {
    "icon": "fas fa-calculator",
    "color": "#00755E",
    "subcategories": {
      "ATM Fee": {
        "icon": "fas fa-credit-card",
      },
      "Bank Fee": {
        "icon": "fas fa-landmark",
      },
      "Late Fee": {
        "icon": "far fa-calendar-times",
      },
      "Service Fee": {
        "icon": "fas fa-receipt",
      },
      "Finance Charge": {
        "icon": "fas fa-envelope-open-text",
      },
      "Trade Commissions": {
        "icon": "fas fa-chart-line",
      },
    }
  },
  "Taxes": {
    "icon": "fas fa-file-signature",
    "color": "#2E5894",
    "subcategories": {
      "Sales Tax": {
        "icon": "fas fa-tag",
      },
      "Property Tax": {
        "icon": "fas fa-sign",
      },
      "Local Tax": {
        "icon": "fas fa-user",
      },
      "State Tax": {
        "icon": "fas fa-user-friends",
      },
      "Federal Tax": {
        "icon": "fas fa-users",
      },
    }
  },
  "Uncategorized": {
    "icon": "far fa-question-circle",
    "color": "#8D90A1",
    "subcategories": {
      "Cash & ATM": {
        "icon": "fas fa-money-bill",
      },
      "Check": {
        "icon": "fas fa-money-check",
      },
    }
  },
}
