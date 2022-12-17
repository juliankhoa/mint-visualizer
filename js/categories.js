var incomeColor = "#4285F4";
var investmentColor = "#29AB87";
var savingsColor = '#7BA05B';
var miscColor = "#8D90A1";

var incomeCategories = {
  "Paycheck": "fas fa-money-check",
  "Bonus": "fas fa-coins",
  "Reimbursement": "fas fa-hand-holding-usd",
  "Returned Purchase": "fas fa-reply",
  "Rental Income": "fas fa-home",
  "Interest Income": "fas fa-percentage",
}

var investmentCategories = {
  "Deposit": {
    "type": "debit",
    "icon": "fas fa-right-to-bracket fa-rotate-90"
  },
  "Withdrawal": {
    "type": "credit",
    "icon": "fas fa-right-from-bracket fa-rotate-270"
  },
  "Buy": {
    "type": "debit",
    "icon": "fas fa-square-plus"
  },
  "Sell": {
    "type": "credit",
    "icon": "fas fa-square-minus"
  },
  "Dividend & Cap Gains": {
    "type": "credit",
    "icon": "fas fa-chart-pie"
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
      "Food Delivery": {
        "icon": "fas fa-bag-shopping",
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
        "icon": "fas fa-gamepad",
      },
      "Books": {
        "icon": "fas fa-book-open",
      },
      "Hobbies": {
        "icon": "fas fa-puzzle-piece",
      },
      "Sporting Goods": {
        "icon": "fas fa-basketball-ball",
      },
    }
  },
  "Entertainment": {
    "icon": "fas fa-dice-six",
    "color": "#652DC1",
    "subcategories": {
      "Movies & DVDs": {
        "icon": "fas fa-film",
      },
      "Music": {
        "icon": "fas fa-music",
      },
      "Amusement": {
        "icon": "fas fa-ticket",
      },
      "Arts": {
        "icon": "fas fa-masks-theater",
      },
      "Newspapers & Magazines": {
        "icon": "fas fa-newspaper",
      },
    }
  },
  "Bills & Utilities": {
    "icon": "fas fa-envelope-open-text",
    "color": "#FFAA1D",
    "subcategories": {
      "Home Phone": {
        "icon": "fas fa-phone",
      },
      "Mobile Phone": {
        "icon": "fas fa-mobile-screen",
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
    "icon": "fas fa-car",
    "color": "#1560BD",
    "subcategories": {
      "Auto Payment": {
        "icon": "fas fa-car-on",
      },
      "Auto Insurance": {
        "icon": "fas fa-car-crash",
      },
      "Gas & Fuel": {
        "icon": "fas fa-gas-pump",
      },
      "Service & Parts": {
        "icon": "fas fa-wrench",
      },
      "Parking": {
        "icon": "fas fa-parking",
      },
      "Public Transportation": {
        "icon": "fas fa-bus-simple",
      },
      "Ride Share": {
        "icon": "fas fa-taxi",
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
        "icon": "fas fa-pump-soap",
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
    "icon": "fas fa-heart-pulse",
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
        "icon": "fas fa-hand-holding-medical",
      },
      "Pharmacy": {
        "icon": "fas fa-prescription-bottle-medical",
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
    "icon": "fas fa-soap",
    "color": "#8F47B3",
    "subcategories": {
      "Laundry": {
        "icon": "fas fa-jug-detergent",
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
    "icon": "fas fa-earth-americas",
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
    "icon": "fas fa-building-columns",
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
    "icon": "fas fa-briefcase",
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
    "icon": "fas fa-children",
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
        "icon": "fas fa-hands-holding-child",
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
    "icon": "fas fa-gifts",
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
    "icon": "fas fa-hand-holding-dollar",
    "color": "#00755E",
    "subcategories": {
      "ATM Fee": {
        "icon": "fas fa-credit-card",
      },
      "Bank Fee": {
        "icon": "fas fa-building-columns",
      },
      "Late Fee": {
        "icon": "fas fa-clock",
      },
      "Service Fee": {
        "icon": "fas fa-receipt",
      },
      "Finance Charge": {
        "icon": "fas fa-envelope-open-text",
      },
      "Trade Commissions": {
        "icon": "fas fa-chart-simple",
      },
    }
  },
  "Taxes": {
    "icon": "fas fa-percent",
    "color": "#2E5894",
    "subcategories": {
      "Sales Tax": {
        "icon": "fas fa-tag",
      },
      "Property Tax": {
        "icon": "fas fa-sign",
      },
      "Local Tax": {
        "icon": "fas fa-landmark-flag",
      },
      "State Tax": {
        "icon": "fas fa-landmark",
      },
      "Federal Tax": {
        "icon": "fas fa-landmark-dome",
      },
    }
  },
  "Uncategorized": {
    "icon": "fas fa-list-ul",
    "color": "#8D90A1",
    "subcategories": {
      "Cash & ATM": {
        "icon": "fas fa-money-bills",
      },
      "Check": {
        "icon": "fas fa-money-check",
      },
    }
  },
}
