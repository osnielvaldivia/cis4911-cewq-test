const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const adminGuard = require('../../middleware/admin_guard');
const { check, validationResult } = require('express-validator/check');

const Company = require('../../models/Company');

// TODO: This file is unfinished

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//                                                                      //
//                     Employee                                         //
//                                                                      //
//                                                                      //
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @route   POST api/employee
// @desc    Create an employee
// @access  Private
router.post(
  '/',
  [
    auth,
    adminGuard,
    [
      check('companyid', 'Company Id is required')
        .not()
        .isEmpty(),
      check('name', 'Employee name is required')
        .not()
        .isEmpty(),
      check('email', 'Employee email is required')
        .not()
        .isEmpty(),
      check('password', 'Employee password is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // Destruct from body
    const { companyid, name, email, password } = req.body;

    try {
      // Obtain company
      let company = await Company.findOne({
        _id: companyid,
      })
        .populate('company', ['name', 'owner', 'employees'])
        .select('-tickets');

      if (!company) {
        return res.status(400).json({
          msg: 'Company not found',
        });
      }
      let employee = await User.findOne({
        email: email,
      });

      if (employee) {
        // Already exists, return 400
        return res.json({
          msg: 'Employee already exists',
        });
      }

      // Build employee object
      const employeeFields = {};
      employeeFields.name = name;
      employeeFields.email = email;

      const salt = await bcrypt.genSalt(10);

      employeeFields.password = await bcrypt.hash(password, salt);

      employee = new User(employeeFields);

      // Save new employee
      await employee.save();

      employee = await User.findOne({
        email: email,
      });

      company.employees.push(employee._id);

      await company.save();

      res.json(employee);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//TODO: Create a GET route for company employees

// @route   Get api/employee
// @desc    Gets all companies
// @access  Private
router.get('/', [auth, adminGuard], async (req, res) => {
  try {
    const companies = await Employee.find()
      .populate('employee', ['name', 'owner'])
      .select('-employees')
      .select('-tickets');
    res.json(companies);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/employee/:employee_id
// @desc    Gets employee by employee ID or name
// @access  Private
router.get('/:employee_id', [auth, adminGuard], async (req, res) => {
  try {
    let employee = await Employee.findOne({
      _id: req.params.employee_id,
    }).populate('employee', ['name', 'owner', 'employees', 'tickets']);

    if (!employee) {
      employee = await Employee.findOne({
        name: req.params.employee_id,
      }).populate('employee', ['name', 'owner', 'employees', 'tickets']);

      if (!employee) {
        return res.status(400).json({
          msg: 'Employee not found',
        });
      }
    }

    let isEmployee = employee.employees.filter(x => x._id.equals(req.user.id))
      .length
      ? true
      : false;

    if (!employee.owner._id.equals(req.user.id)) {
      return res.status(400).json({
        msg: 'You are not the owner of this employee',
      });
    }

    res.json(employee);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Employee not found',
      });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/employee/:employee_id
// @desc    Deletes employee by employee ID or name
// @access  Private
router.delete('/:employee_id', [auth, adminGuard], async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.employee_id,
    }).populate('employee', ['name', 'owner', 'employees', 'tickets']);

    if (!employee) {
      return res.status(400).json({
        msg: 'Employee not found',
      });
    }

    if (!employee.owner._id.equals(req.user.id)) {
      return res.status(400).json({
        msg: 'You are not the owner of this employee',
      });
    }

    await Employee.findOneAndRemove({
      _id: req.params.employee_id,
    });

    res.json({
      msg: 'Employee deleted',
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Employee not found',
      });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
