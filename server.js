//DEPENDENCIES
//---------------------------------------------------
//---------------------------------------------------
const mysql = require("mysql");
const table= require('console.table');
const inquirer=require("inquirer");


//Connecting to your mySQL database
const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    
    //Your database
    database: "employee_trackerDB"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    initialPrompt();
  });

  const initialPrompt = () =>
    inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'What would you like to do?',
          choices: [
            'View All Employees',
            'View All Departments',
            'View All Roles',
            'Add Employee',
            'Add Department',
            'Add Role',
            'Update Employee Role',
            'Exit',
          ],
        },
    ]).then(answer => {
      switch (answer.action){
      case 'View All Employees':
      viewAllEmployees();
      break;

      case 'View All Departments':
      viewAllDepartments();
      break;

      case 'View All Roles':
      viewAllRoles();
      break;

      case 'Add Employee':
      addEmployee();
      break;

      case 'Add Department':
      addDepartment();
      break;

      case 'Add Role':
      addRole();
      break;

      case 'Update Employee Role':
      updateEmployeeRole();
      break;

      case 'Exit':
        connection.end();
      break;
    }
    })

