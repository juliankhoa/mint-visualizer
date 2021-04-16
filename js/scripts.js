(function($) {
  'use strict';

  $(document).ready(function() {
    buildCategoryTree();
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();
    $('#fileUpload').popover('show');
    document.getElementById('fileUpload').addEventListener(
      'change', loadTransactions, false
    );
  });

  $('#sidebarToggle').on('click', function(e) {
    e.preventDefault();
    $('body').toggleClass('sb-sidenav-toggled');
  });

  // Initalize table and charts
  var table = $('#dataTable').DataTable({
    dom: '<f<t>p>'
  });
  var sankeyChart = am4core.create('sankeyChart', am4charts.SankeyDiagram);
  var breakdownChart = am4core.create('breakdownChart', am4charts.PieChart);
  var timeChart = am4core.create('timeChart', am4charts.XYChart);
  am4core.useTheme(am4themes_animated);
  am4core.options.autoDispose = true;

  var nodeDict = {}; // Maps node names to corresponding node object
  function Node(name, parent, color) {
    this.name = name; // Name of category/merchant
    this.parent = parent; // Parent node (category)
    this.children = []; // List of subcategory/merchant nodes
    this.amount = 0; // Total dollar amount
    this.dateAmounts = []; // List of objects containing dates and their amounts
    this.color = color; // Display color for charts
    nodeDict[name] = this;
    if (parent) parent.children.push(this);

    // Add amount to this category and parent categories
    this.addAmount = function(num, date) {
      this.amount += num;
      var dateAmount = this.dateAmounts.find(da => da.date == date);
      if (!dateAmount) this.dateAmounts.push({
        date: date,
        amount: num
      });
      else dateAmount.amount += num;
      if (this.parent) {
        this.parent.addAmount(num, date);
      }
    }

    // Determine if this node is a descendant of given node
    this.isChildOf = function(node) {
      if (this.parent == node) return true;
      else if (this.parent === null) return false;
      else return this.parent.isChildOf(node);
    }
  }

  var transactions = []; // All transactions from CSV file
  // Base nodes
  var incomeNode = new Node('Income', null, incomeColor);
  var expenseNode = new Node('Expenses', null, incomeColor);
  var investmentNode = new Node('Investments', expenseNode, investmentColor);
  var investIncomeNode = new Node('Investment Income', incomeNode, investmentColor);

  // Base category to filter transactions (default = all expenses)
  var rootNode = expenseNode;
  // Start/end dates of timeframe to filter transactions (default = all time)
  var startDate = new Date(0, 0, 1);
  var endDate = new Date();
  // Date of earliest recorded transaction
  var earliestDate = endDate;

  // Convert category name to selector format
  function toSelector(categoryName) {
    return categoryName.replaceAll(' ', '-').replaceAll('&', 'and');
  }

  // Get all category info to build node tree and create filter nav links
  function buildCategoryTree() {
    buildCategoryFilter('Income', 'fas fa-wallet', incomeColor, incomeCategories);
    buildCategoryFilter('Investments', 'fas fa-chart-line', investmentColor, investmentCategories);
    $.each(expenseCategories, function(catName, catInfo) {
      buildCategoryFilter(catName, catInfo.icon, catInfo.color, catInfo.subcategories);
    });
    $('.category-filter').click(function() {
      updateRootNode($(this).data('value'));
    });
  }

  // Create category nav dropdown containing subcategory links + their node objects
  function buildCategoryFilter(catName, catIcon, catColor, subcategories) {
    var catNode;
    if (nodeDict[catName]) catNode = nodeDict[catName];
    else catNode = new Node(catName, expenseNode, catColor);

    var navDropBtn = $(
      `<a class="nav-link collapsed py-0 ${toSelector(catName)}" data-toggle="collapse" data-target=` +
      `"#collapse${toSelector(catName)}" aria-expanded="false" aria-controls="collapse${toSelector(catName)}">` +
      `<h5><span class="badge badge-primary" style="background-color:${catColor}">` +
      `<i class="${catIcon} fa-fw mr-1"></i>${catName}` +
      `</span></h5>` +
      `<div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div>` +
      `</a>`);
    $('#categoryFilters').append(navDropBtn);

    var navCollapse = $(`<div class="collapse" id="collapse${toSelector(catName)}" data-parent="#sidenavAccordion">`);
    var navDropMenu = $('<nav class="sb-sidenav-menu-nested nav"></nav>');
    navDropMenu.append(buildSubcategoryFilter(catName, catIcon));
    navDropMenu.append('<hr>');
    $.each(subcategories, function(subcatName, subcatInfo) {
      var parentNode = catNode;
      // Count investment income as income subcategories
      if (parentNode == investmentNode && subcatInfo.type == 'credit')
        parentNode = incomeNode;
      new Node(subcatName, parentNode, catColor);
      var subcatIcon = subcatInfo.icon;
      if (catName == 'Income') subcatIcon = subcatInfo;
      navDropMenu.append(buildSubcategoryFilter(subcatName, subcatIcon));
    });
    new Node('Other ' + catName, catNode, catColor);
    navDropMenu.append(buildSubcategoryFilter('Other ' + catName, catIcon));
    navCollapse.append(navDropMenu);
    $('#categoryFilters').append(navCollapse);
  }

  // Create subcategory nav link
  function buildSubcategoryFilter(name, icon) {
    var dropItem = $(
      `<a id="${toSelector(name)}" class="nav-link category-filter p-1 ${toSelector(name)}"` +
      `data-value="${name}"><i class="${icon} fa-fw mr-1"></i>${name}</a>`
    );
    return dropItem;
  }

  // Change root node and update table and charts
  function updateRootNode(nodeName) {
    var node = nodeDict[nodeName]
    if (node && node.children.length > 0) {
      rootNode = node;
      // Turn off investments filter if root node is an investment category
      $.each(investmentCategories, function(catName, catInfo) {
        if (node == investmentNode || node.name == catName) {
          $('#includeInvestments').prop('checked', true)
          return false;
        }
      });
      $('#allTimePreset').trigger('click');

      $('.category-filter').each(function() {
        if ($(this).attr('id') == toSelector(nodeName))
          $(this).addClass('active');
        else
          $(this).removeClass('active');
      });
      if (nodeName == 'Expenses') nodeName = 'Income & Expenses';
      $('#categoryHeader').html(nodeName);
    }
  }

  // Change start/end date and update table and charts
  function updateTimeframe(newStart, newEnd, adjustForTime) {
    startDate = newStart;
    endDate = newEnd;
    if (adjustForTime) {
      startDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
      endDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);
    }
    $('#startDate').val(startDate.toISOString().split('T')[0]);
    $('#endDate').val(endDate.toISOString().split('T')[0]);
    updateTransactions();
  }

  // Set start/end dates based on selected timeframe preset
  $('.timeframe-preset').click(function() {
    $('.timeframe-preset').removeClass('active');
    $(this).addClass('active');

    let endDate = new Date();
    let startDate = new Date();
    let timeframe = $(this).html();
    if (timeframe == 'All Time') {
      startDate = new Date(0, 0, 1);
    } else if (timeframe == 'This Year') {
      startDate.setMonth(0);
      startDate.setDate(1);
    } else if (timeframe == 'This Month') {
      startDate.setDate(1);
    } else if (timeframe == 'Last 14 Days') {
      startDate.setDate(endDate.getDate() - 14);
    } else if (timeframe == 'Last 7 Days') {
      startDate.setDate(endDate.getDate() - 7);
    }
    updateTimeframe(startDate, endDate, true);
  });

  // Manual start/end date entry
  $('#startDate').change(function() {
    $('.timeframe-preset').removeClass('active');
    startDate = new Date($(this).val());
    if (startDate > endDate) endDate = startDate;
    updateTimeframe(startDate, endDate, false);
  });
  $('#endDate').change(function() {
    $('.timeframe-preset').removeClass('active');
    endDate = new Date($(this).val());
    if (endDate < startDate) startDate = endDate;
    updateTimeframe(startDate, endDate, false);
  });

  // Map column names to indexes
  var colNum = {
    'Date': -1,
    'Description': -1,
    'Amount': -1,
    'Transaction Type': -1,
    'Category': -1
  };
  // Get transactions from uploaded file
  function loadTransactions(e) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
      alert('Browser does not support uploading files');
    } else {
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(e) {
        var csvData = e.target.result;
        transactions = $.csv.toArrays(csvData);
        if (transactions && transactions.length > 0) {
          $.each(transactions[0], function(c, header) {
            if (colNum[header]) colNum[header] = c;
          });
          $.each(colNum, function(k, v) {
            if (v < 0) {
              alert(`${file.name} is missing '${k}' data`);
              return false;
            }
          });
          $('#fileUpload').popover('hide');
          // Reset category/timeframe filter
          updateRootNode('Expenses');
          $('#headerForm').show();
          // Hide filter buttons for categories with zero transactions
          $('.nav-link').show();
          var catFilterNodes = [incomeNode, investmentNode].concat(expenseNode.children);
          $.each(catFilterNodes, function(i, catNode) {
            if (catNode.amount <= 0)
              $('.' + toSelector(catNode.name)).hide();
            else {
              $.each(catNode.children, function(j, subcatNode) {
                if (subcatNode.amount <= 0)
                  $('#' + toSelector(subcatNode.name)).hide();
              });
            }
          });
        } else {
          alert('No data to import!');
        }
      };
      reader.onerror = function() {
        alert('Unable to read ' + file.name);
      };
    }
  }

  // Apply filters to all transactions and display table/charts
  function updateTransactions() {
    if (transactions.length == 0) return;
    // Reset category amounts, earliest transaction date, and table
    $.each(nodeDict, function(n, node) {
      node.amount = 0;
      node.dateAmounts = [];
    });
    earliestDate = endDate;
    table.destroy();
    $('#tableRows').empty();

    // Verify transaction data format
    $.each(transactions, function(r, row) {
      if (r == 0) return;
      if (!row[colNum['Date']].match(/^\d{1,2}\/\d{2}\/\d{4}$/) ||
        !row[colNum['Amount']].match(/^\d+\.\d{2}$/) ||
        !row[colNum['Transaction Type']].match(/^debit|credit$/) ||
        !row[colNum['Description']] || !row[colNum['Category']]) {
        alert('Error in row ' + r);
        return false;
      }

      let dateMDY = row[colNum['Date']].split('/');
      let month = dateMDY[0] < 10 ? '0' + dateMDY[0] : dateMDY[0];
      let date = dateMDY[2] + '/' + month + '/' + dateMDY[1],
        description = row[colNum['Description']],
        amount = Number(row[colNum['Amount']]),
        category = row[colNum['Category']];

      // Skip transactions out of timeframe
      let dateUTC = new Date(date.replaceAll('/', '-') + 'Z');
      if (dateUTC < startDate || dateUTC > endDate) return;

      // Apply special filters
      if ((category == 'Investments' || investmentCategories[category]) &&
        !$('#includeInvestments').prop('checked')) return;
      if (category == 'Hide from Budgets & Trends') return;

      if (category == 'Buy' || category == 'Sell') {
        // Simplify stock order descriptions to just the ticker symbol
        description = description.replace(/X+\s+of\s+/, '');
        let tickerMatch = description.match(/[A-Z]{2,5}(\.[A-Z]{1,2})*/);
        if (tickerMatch) description = tickerMatch[0];
      }
      // Remove phone/transaction numbers from descriptions
      description = description.replace(/\d{3}(-\d+)+/, '');
      // Shorten descriptions
      if (row[colNum['Transaction Type']] == 'credit') description = description.replace('Deposit', '');
      description = description.replace(/\s-|-\s/, ' ');
      if (description.length > 20) {
        description = description.split(' ').slice(0, 2).join(' ');
      }

      let amountStr = toDollars(amount);
      let amountColor = 'green';
      // Node name includes category because a merchant may fall under multiple
      // categories (ex. 'Apple (Electronics & Software)' vs. 'Apple (Music)')
      let nodeName = `${description} (${category})`;
      let merchantNode; // Merchant node to add transaction to

      if (row[colNum['Transaction Type']] == 'debit') {
        amountStr = '-' + amountStr;
        amountColor = 'black';
        // If merchant node exists, add to its amount
        if (nodeDict[nodeName]) {
          merchantNode = nodeDict[nodeName];
        }
        // Otherwise if category exists, create new merchant under it and add to its amount
        else if (nodeDict[category]) {
          // Reclassify general category tag to "other" subcategory
          if (expenseCategories[category] || category == 'Investments') {
            category = 'Other ' + category;
          }
          merchantNode = new Node(nodeName, nodeDict[category], nodeDict[category].color);
        }
        // Otherwise add to "Other" category node amount
        else if (category != 'Transfer' && category != 'Credit Card Payment') {
          // Default unrecognized categories to "Other Uncategorized"
          if (!nodeDict[category]) category = 'Other Uncategorized';
          merchantNode = new Node(nodeName, nodeDict['Other Uncategorized'], miscColor);
        }
      } else if (row[colNum['Transaction Type']] == 'credit') {
        // If source node exists, add to its amount
        if (nodeDict[nodeName]) {
          merchantNode = nodeDict[nodeName];
        }
        // Otherwise if category exists, create new source under it and add to its amount
        else if (nodeDict[category] && category != 'Income') {
          var parentNode = nodeDict[category];
          if (category == 'Investments') {
            parentNode = investIncomeNode;
            // Don't count transfers to investment account as income
            if (description.toUpperCase().includes('DEPOSIT')) return;
          }
          merchantNode = new Node(nodeName, parentNode, parentNode.color);
        }
        // Otherwise add to "Other Income" category node amount
        else if (category != 'Transfer' && category != 'Credit Card Payment') {
          merchantNode = new Node(nodeName, nodeDict['Other Income'], incomeColor);
        }
        // If credit was from an expense merchant (refund), subtract amount
        if (merchantNode && merchantNode.isChildOf(expenseNode))
          amount = -amount;
      }

      let rowStyle = '';
      let badgeColor = miscColor;
      if (merchantNode) {
        merchantNode.addAmount(amount, date);
        badgeColor = merchantNode.color;
        if (rootNode != expenseNode && !merchantNode.isChildOf(rootNode)) return;
      }

      if (category == 'Transfer' || category == 'Credit Card Payment') {
        if (rootNode != expenseNode) return;
        rowStyle = 'style="color: grey"';
        amountColor = 'grey';
      } else if (dateUTC < earliestDate) {
        earliestDate = dateUTC;
      }

      $('#tableRows').append(`<tr ${rowStyle}>` +
        `<td>${date}</td>` +
        `<td>${description}</td>` +
        `<td style="color:${amountColor}">${amountStr}</td>` +
        `<td><span class="badge table-badge text-white" style="background-color:${badgeColor}">` +
        `${category.replace('Other ', '')}</span></td>` +
        `</tr>`);
    });

    // Update start date input to show earliest relevant transaction date
    if ($('#allTimePreset').hasClass('active')) {
      startDate = new Date(earliestDate.getTime() - earliestDate.getTimezoneOffset() * 60000);
      $('#startDate').val(startDate.toISOString().split('T')[0]);
    }
    if (rootNode == expenseNode || rootNode == incomeNode) $('#investmentsSwitch').show();
    else $('#investmentsSwitch').hide();

    sortNodes(incomeNode);
    sortNodes(rootNode);
    drawSankeyChart();
    drawBreakdownChart();
    drawTimeChart();
    updateTrends();
    table = $('#dataTable').DataTable({
      dom: '<f<t>p>'
    });
  }

  $('input[type=checkbox]').click(function() {
    updateTransactions();
  });

  $('input[type=radio]').click(function() {
    drawBreakdownChart();
  });

  $('#dataTable').on('draw.dt', function() {
    $('.table-badge').click(function() {
      updateRootNode($(this).html().replace('&amp;', '&'));
    });
  });

  // Sort descendant nodes by amount in decreasing order and group small amounts
  function sortNodes(node) {
    if (node.children.length == 0) return;
    $.each(node.children, function(i, childNode) {
      sortNodes(childNode);
    });
    node.children.sort((a, b) => b.amount - a.amount);

    if (!$('#showAllMerchants').prop('checked') && node != expenseNode) {
      let otherAmount = 0;
      for (let i = 10; i < node.children.length; i++) {
        otherAmount += node.children[i].amount;
        node.children[i].amount = 0;
      }
      if (otherAmount > 0) {
        let otherNode = new Node(`Other (${node.name})`, node, node.color);
        otherNode.amount = otherAmount;
      }
    }
  }

  // Format numerical amount to dollar string
  function toDollars(num) {
    return '$' + num.toLocaleString(undefined, {
      minimumFractionDigits: 2
    });
  }
  // Format percentage to one decimal place
  function toPercent(part, whole) {
    return Math.round(part / whole * 1000) / 10 + '%';
  }

  function drawSankeyChart() {
    sankeyChart = am4core.create('sankeyChart', am4charts.SankeyDiagram);
    let fntLight = '[font-weight:lighter]';
    let fntSmall = '[font-size:.8rem]';

    let rootNodeName;
    // If root node is expenses (all categories), display income stream too
    if (rootNode == expenseNode) {
      rootNodeName = `Income: [font-weight:lighter]${toDollars(incomeNode.amount)}`;
      sankeyChart.data = [];
      $.each(incomeNode.children, function(i, node) {
        let nodeName = `${node.name.replace(/\s*\(.*\)\s*/, '')}: ${fntLight}${toDollars(node.amount)}`;
        let toolTip = `${nodeName}\n${fntSmall}${toPercent(node.amount, incomeNode.amount)} of Income`;
        if (node.amount > 0)
          sankeyChart.data.push({
            from: nodeName,
            to: rootNodeName,
            value: node.amount,
            color: incomeColor,
            toolTip: toolTip
          });
      });
    } else {
      rootNodeName = `${rootNode.name}: ${fntLight}${toDollars(rootNode.amount)}`;
    }

    var numEndNodes = 0;
    var maxLabel = '';
    $.each(rootNode.children, function(i, catNode) {
      if (catNode.amount > 0) {
        let catNodeName = `${catNode.name.replace(/\s*\(.*\)\s*/, '')}: ${fntLight}${toDollars(catNode.amount)}`;
        let toolTip = catNodeName;
        if (rootNode == expenseNode) toolTip += `\n${fntSmall}${toPercent(catNode.amount, incomeNode.amount)} of Income`;
        toolTip += `\n${fntSmall}${toPercent(catNode.amount, rootNode.amount)} of ${rootNode.name}`;
        sankeyChart.data.push({
          from: rootNodeName,
          to: catNodeName,
          value: catNode.amount,
          color: catNode.color,
          toolTip: toolTip
        });
        if (catNodeName.length > maxLabel.length) maxLabel = catNodeName;
        if (catNode.children.length == 0) numEndNodes++;
        $.each(catNode.children, function(i, subcatNode) {
          let subcatNodeName = `${subcatNode.name.replace(/\s*\(.*\)\s*/, '')}: ${fntLight}${toDollars(subcatNode.amount)}`;
          toolTip = `${subcatNodeName}\n${fntSmall}${toPercent(subcatNode.amount, catNode.amount)} of ${catNode.name}`;
          if (subcatNode.amount > 0) {
            sankeyChart.data.push({
              from: catNodeName,
              to: subcatNodeName,
              value: subcatNode.amount,
              color: catNode.color,
              toolTip: toolTip
            });
            numEndNodes++;
            if (subcatNodeName.length > maxLabel.length) maxLabel = subcatNodeName;
          }
        });
      }
    });

    let savingsAmount = 0;
    if (rootNode == expenseNode) {
      savingsAmount = incomeNode.amount - expenseNode.amount;
      let savingsNodeName = `Savings: ${fntLight}${toDollars(savingsAmount)}`;
      let toolTip = savingsNodeName + `\n${fntSmall}${toPercent(savingsAmount, incomeNode.amount)} of Income`;
      if (savingsAmount > 0) {
        sankeyChart.data.push({
          from: rootNodeName,
          to: savingsNodeName,
          value: savingsAmount,
          color: savingsColor,
          toolTip: toolTip
        });
        numEndNodes++;
        if (savingsNodeName.length > maxLabel.length) maxLabel = savingsNodeName;
      }
    }

    // Adjust Sankey chart to fit all end nodes/labels
    $('#sankeyChart').css('height', Math.max(numEndNodes * 1.5, 30) + 'rem');
    $('#breakdownChart').css('height', Math.max(numEndNodes * 1.5, 30) + 'rem');
    sankeyChart.padding(10, (maxLabel.length - 20) * 8, 10, 10);
    sankeyChart.responsive.enabled = true;

    if (rootNode.amount == 0 && savingsAmount == 0) {
      sankeyChart.padding(10, 10, 10, 10);
      let msg = sankeyChart.createChild(am4core.Label);
      msg.text = 'No data for the given category and time frame';
      msg.isMeasured = false;
      msg.horizontalCenter = 'middle';
      msg.x = am4core.percent(50);
      msg.y = am4core.percent(50);
      msg.fontSize = 20;
    }

    sankeyChart.dataFields.fromName = 'from';
    sankeyChart.dataFields.toName = 'to';
    sankeyChart.dataFields.value = 'value';
    sankeyChart.dataFields.color = 'color';
    sankeyChart.minNodeSize = 0.003;

    var nodeTemplate = sankeyChart.nodes.template;
    nodeTemplate.width = 20;
    nodeTemplate.draggable = false;
    nodeTemplate.nameLabel.label.truncate = false;
    nodeTemplate.events.off('hit');
    nodeTemplate.events.on('hit', function(e) {
      updateRootNode(e.target.dataItem.dataContext.to.split(':')[0]);
    }, this);
    nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    var linkTemplate = sankeyChart.links.template
    linkTemplate.colorMode = 'toNode';
    linkTemplate.tooltipText = '{toolTip}';
  }

  function drawBreakdownChart() {
    // Create chart theme from root category color
    function colorTheme(target) {
      if (target instanceof am4core.ColorSet) {
        target.list = [am4core.color(rootNode.color)];
      }
    }
    am4core.useTheme(colorTheme);

    var breakdownData = [];
    $.each(rootNode.children, function(i, catNode) {
      if (catNode.amount > 0) {
        var childNodes = [];
        if ($('#showTreeMap').prop('checked')) {
          $.each(catNode.children, function(i, childNode) {
            if (childNode.amount > 0) {
              childNodes.push({
                name: childNode.name.replace(/\s*\(.*\)\s*/, ''),
                amount: childNode.amount,
                color: childNode.color
              });
            }
          });
        }
        breakdownData.push({
          name: catNode.name.replace(/\s*\(.*\)\s*/, ''),
          amount: catNode.amount,
          color: catNode.color,
          children: childNodes
        });
      }
    });

    if ($('#showPieChart').prop('checked')) {
      breakdownChart = am4core.create('breakdownChart', am4charts.PieChart);
      breakdownChart.data = breakdownData;
      breakdownChart.radius = am4core.percent(90);
      breakdownChart.innerRadius = am4core.percent(60);
      breakdownChart.padding(1, 1, 1, 1);

      var pieSeries = breakdownChart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.category = 'name';
      pieSeries.dataFields.value = 'amount';
      pieSeries.labels.template.disabled = true;
      pieSeries.hiddenState.properties.opacity = 1;
      pieSeries.hiddenState.properties.endAngle = -90;
      pieSeries.hiddenState.properties.startAngle = -90;

      var sliceTemplate = pieSeries.slices.template;
      sliceTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
      sliceTemplate.stroke = '#fff';
      sliceTemplate.tooltipText = '{name}: [font-weight:lighter]' +
        '{value.percent.formatNumber("#.0")}%\n[font-size:.9rem]' +
        '{value.formatNumber("$#,###.00")}';

      if (rootNode == expenseNode) {
        sliceTemplate.propertyFields.fill = 'color';
      }

      sliceTemplate.events.on('hit', function(e) {
        updateRootNode(e.target.dataItem.dataContext.name);
      }, this);

      let centerLabel = pieSeries.createChild(am4core.Label);
      centerLabel.text = '{values.value.sum.formatNumber("$#,###.00")}';
      centerLabel.horizontalCenter = 'middle';
      centerLabel.verticalCenter = 'middle';
      centerLabel.fontSize = 20;

      breakdownChart.legend = new am4charts.Legend();
      breakdownChart.legend.maxHeight = 200;
      breakdownChart.legend.scrollable = true;
      breakdownChart.legend.valueLabels.template.align = 'right';
      breakdownChart.legend.valueLabels.template.textAlign = 'end';

      let markerTemplate = breakdownChart.legend.markers.template;
      markerTemplate.width = 15;
      markerTemplate.height = 15;
      markerTemplate.children.getIndex(0).cornerRadius(15, 15, 15, 15);

      pieSeries.legendSettings.labelText = '{name}:';
      pieSeries.legendSettings.valueText = '[font-weight:lighter]' +
        '{value.percent.formatNumber("#.0")}%';

      let grouper = pieSeries.plugins.push(new am4plugins_sliceGrouper.SliceGrouper());
      grouper.groupName = 'Other';
      grouper.groupProperties.fill = miscColor;
      grouper.threshold = 1;
      grouper.clickBehavior = 'zoom';
    } else if ($('#showBarChart').prop('checked')) {
      breakdownChart = am4core.create('breakdownChart', am4charts.XYChart);
      breakdownChart.data = breakdownData.reverse();
      breakdownChart.numberFormatter.numberFormat = '$#,###';
      breakdownChart.padding(10, 10, 10, 10);

      var categoryAxis = breakdownChart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'name';
      categoryAxis.cursorTooltipEnabled = false;
      categoryAxis.renderer.labels.template.disabled = true;
      categoryAxis.renderer.grid.template.location = 0;

      var valueAxis = breakdownChart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.cursorTooltipEnabled = false;
      valueAxis.extraMax = 0.1;

      var barSeries = breakdownChart.series.push(new am4charts.ColumnSeries());
      barSeries.dataFields.categoryY = 'name';
      barSeries.dataFields.valueX = 'amount';

      var columnTemplate = barSeries.columns.template;
      columnTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
      columnTemplate.strokeWidth = 0;
      columnTemplate.tooltipText = '{valueX.formatNumber("$#,###.00")}';
      columnTemplate.tooltipX = am4core.percent(100);

      if (rootNode == expenseNode) {
        columnTemplate.propertyFields.fill = 'color';
      }

      columnTemplate.events.on('hit', function(e) {
        updateRootNode(e.target.dataItem.dataContext.name);
      }, this);

      var valueLabel = barSeries.bullets.push(new am4charts.LabelBullet());
      valueLabel.label.text = '{name}';
      valueLabel.label.truncate = false;
      valueLabel.label.hideOversized = false;
      valueLabel.label.horizontalCenter = 'left';
      valueLabel.label.dx = 5;

      breakdownChart.cursor = new am4charts.XYCursor();
      breakdownChart.cursor.snapToSeries = barSeries;
      breakdownChart.cursor.lineX.disabled = true;
      breakdownChart.cursor.lineY.disabled = true;
      breakdownChart.cursor.behavior = 'none';
    } else if ($('#showTreeMap').prop('checked')) {
      breakdownChart = am4core.create('breakdownChart', am4charts.TreeMap);
      breakdownChart.data = breakdownData;
      breakdownChart.dataFields.name = 'name';
      breakdownChart.dataFields.value = 'amount';
      breakdownChart.dataFields.children = 'children';
      breakdownChart.padding(10, 10, 10, 10);

      var group = breakdownChart.seriesTemplates.create(0);
      var groupLabel = group.columns.template.createChild(am4core.Label);
      groupLabel.text = '{name}';
      groupLabel.align = 'center';
      groupLabel.valign = 'middle';
      groupLabel.strokeWidth = 0;
      groupLabel.opacity = 0.5;

      var subGroup = breakdownChart.seriesTemplates.create(1);
      subGroup.tooltip.pointerOrientation = 'vertical';
      subGroup.fillOpacity = 0;
      var subGroupTemplate = subGroup.columns.template;
      subGroupTemplate.column.cornerRadius(2, 2, 2, 2);
      subGroupTemplate.strokeWidth = 2;
      subGroupTemplate.tooltipText = '{name}: [font-weight:lighter]' +
        '{amount.formatNumber("$#,###.00")}';

      if (rootNode == expenseNode) {
        breakdownChart.dataFields.color = 'color';
      }

      subGroupTemplate.events.on('hit', function(e) {
        updateRootNode(e.target.dataItem.dataContext.name);
      }, this);
    }
    breakdownChart.responsive.enabled = true;
  }

  function drawTimeChart() {
    rootNode.dateAmounts.sort((a, b) => (a.date < b.date) ? -1 : ((b.date < a.date) ? 1 : 0));

    timeChart = am4core.create('timeChart', am4charts.XYChart);
    timeChart.data = rootNode.dateAmounts;
    timeChart.dateFormatter.inputDateFormat = 'yyyy/MM/dd';
    timeChart.numberFormatter.numberFormat = '$#';
    timeChart.responsive.enabled = true;
    timeChart.padding(10, 10, 10, 10);

    var dateAxis = timeChart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;
    let diffDays = Math.round((endDate - earliestDate) / 86400000);
    let timeUnit = 'day';
    if (diffDays > 730) timeUnit = 'year';
    else if (diffDays > 59) timeUnit = 'month';
    dateAxis.groupInterval = {
      timeUnit: timeUnit,
      count: 1
    };
    dateAxis.groupData = true;

    var valueAxis = timeChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.cursorTooltipEnabled = false;

    let axisTooltip = dateAxis.tooltip;
    axisTooltip.background.fill = '#2D383A';
    axisTooltip.background.cornerRadius = 3;
    axisTooltip.background.pointerLength = 0;
    axisTooltip.dy = 5;

    var timeSeries = timeChart.series.push(new am4charts.ColumnSeries());
    timeSeries.dataFields.dateX = 'date';
    timeSeries.dataFields.valueY = 'amount';
    timeSeries.groupFields.valueY = 'sum';
    timeSeries.tooltipText = '{valueY.formatNumber("$#,###.00")}';
    timeSeries.tooltip.pointerOrientation = 'vertical';
    timeSeries.columns.template.stroke = rootNode.color;
    timeSeries.columns.template.fill = rootNode.color;
    timeSeries.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    timeSeries.columns.template.events.on('hit', function(e) {
      let date = e.target.dataItem.dataContext.date;
      let dateUTC = new Date(date.replaceAll('/', '-') + 'Z');
      startDate = dateUTC;
      endDate = dateUTC;
      let adjustForTime = true;
      if (timeUnit == 'year') {
        startDate = new Date(dateUTC.getFullYear(), 0, 1);
        endDate = new Date(dateUTC.getFullYear(), 11, 31);
      } else if (timeUnit == 'month') {
        startDate.setDate(1);
        endDate = new Date(dateUTC.getFullYear(), dateUTC.getMonth() + 1, 0);
      } else {
        adjustForTime = false;
      }
      $('.timeframe-preset').removeClass('active');
      updateTimeframe(startDate, endDate, adjustForTime);
    });

    timeChart.cursor = new am4charts.XYCursor();
    timeChart.cursor.snapToSeries = timeSeries;
    timeChart.cursor.lineX.disabled = true;
    timeChart.cursor.lineY.disabled = true;
    timeChart.cursor.behavior = 'none';
  }

  function updateTrends() {
    var merchantNodes = [];
    $.each(nodeDict, function(nodeName, node) {
      if (!node.isChildOf(rootNode) || nodeName.replace(/\s*\(.*\)\s*/, '') == 'Other') {
        return;
      }
      if (node.children.length == 0 && node.amount > 0) {
        merchantNodes.push(node);
      }
    });

    $('#topSpent').empty();
    var topAmounts = merchantNodes.sort((a, b) => b.amount - a.amount).slice(0, 10);

    $.each(topAmounts, function(i, merchant) {
      var name = merchant.name.replace(/\s*\(.*\)\s*/, '');
      $('#topSpent').append(
        `<li class="list-group-item d-flex justify-content-between align-items-center p-2">` +
        `<span class="text-muted">${i+1}.</span>${name}<span class="badge badge-primary badge-pill" ` +
        `style="background-color:${merchant.color}">${toDollars(merchant.amount)}</span>` +
        `</li>`);
    });

    $('#topFrequent').empty();
    var topFrequent = merchantNodes.sort((a, b) => b.dateAmounts.length - a.dateAmounts.length).slice(0, 10);

    $.each(topFrequent, function(i, merchant) {
      var name = merchant.name.replace(/\s*\(.*\)\s*/, '');
      $('#topFrequent').append(
        `<li class="list-group-item d-flex justify-content-between align-items-center p-2">` +
        `<span class="text-muted">${i+1}.</span>${name}<span class="badge badge-primary badge-pill" ` +
        `style="background-color:${merchant.color}">${merchant.dateAmounts.length}</span>` +
        `</li>`);
    });
  }
})(jQuery);
