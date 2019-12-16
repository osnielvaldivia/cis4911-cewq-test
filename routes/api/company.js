const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ownerGuard = require('../../middleware/owner_guard');
const { check, validationResult } = require('express-validator/check');

const Company = require('../../models/Company');

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//                                                                      //
//                     Company                                          //
//                                                                      //
//                                                                      //
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// @route   POST api/company
// @desc    Create a company
// @access  Private
router.post(
  '/',
  [
    auth,
    ownerGuard,
    [
      check('name', 'Company name is required')
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
    const { name } = req.body;

    // See if company already exists
    try {
      let company = await Company.findOne({
        name: name,
      });

      if (company) {
        // Already exists, return 400
        return res.status(400).json({
          msg: 'Company already exists',
        });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }

    // See if owner already has a company
    try {
      let company = await Company.findOne({
        owner: req.user.id
      });

      if (company) {
        // Owner already has company, return 400
        return res.status(400).json({
          msg: 'Owner already has a company',
        });
      }
    }
    catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }

    // Build company object
    const companyFields = {};
    companyFields.name = name;
    companyFields.owner = req.user.id;
    companyFields.employees = [];
    companyFields.tickets = [];
    companyFields.admins = [];

    try {
      // Save new company
      company = new Company(companyFields);
      await company.save();
      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   Get api/company
// @desc    Gets all companies
// @access  Private
router.get('/', [auth, ownerGuard], async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('company', ['name', 'owner'])
      .select('-employees')
      .select('-admins')
      .select('-tickets');
    res.json(companies);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/company/:company_id
// @desc    Gets company by company ID or name
// @access  Private
router.get('/:company_id', [auth, ownerGuard], async (req, res) => {
  try {
    let company = await Company.findOne({
      _id: req.params.company_id,
    }).populate('company', ['name', 'owner', 'employees', 'tickets', 'admins']);

    if (!company) {
      company = await Company.findOne({
        name: req.params.company_id,
      }).populate('company', [
        'name',
        'owner',
        'employees',
        'tickets',
        'admins',
      ]);

      if (!company) {
        return res.status(400).json({
          msg: 'Company not found',
        });
      }
    }

    let isEmployee = company.employees.filter(x => x._id.equals(req.user.id))
      .length
      ? true
      : false;

    if (!company.owner._id.equals(req.user.id)) {
      return res.status(400).json({
        msg: 'You are not the owner of this company',
      });
    }

    res.json(company);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Company not found',
      });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/company/:company_id
// @desc    Deletes company by company ID or name
// @access  Private
router.delete('/:company_id', [auth, ownerGuard], async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.company_id,
    }).populate('company', ['name', 'owner', 'employees', 'tickets', 'admins']);

    if (!company) {
      return res.status(400).json({
        msg: 'Company not found',
      });
    }

    if (!company.owner._id.equals(req.user.id)) {
      return res.status(400).json({
        msg: 'You are not the owner of this company',
      });
    }

    await Company.findOneAndRemove({
      _id: req.params.company_id,
    });

    res.json({
      msg: 'Company deleted',
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Company not found',
      });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
