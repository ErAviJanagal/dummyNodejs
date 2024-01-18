const User = require('../models/user');
const Joi = require('joi');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } 
  catch (error) {
    console.error('Error fetching users:.', error);
    res.status(500).send('Internal Server Error');
  }
};



exports.insert = async (req, res) => {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(), 
  });

  const result = schema.validate(req.body);

  if (result.error) {
    // Validation failed
    console.error(result.error.details);
    res.status(400).json({ error: result.error.details[0].message });
  } else {
    // Validation passed
    console.log('Data is valid');

    try {
      const { name, email } = req.body;

      // Insert the user into the database
      const user = await User.create({ name, email });

      // Send a success response
      res.status(201).json({ user });
    } catch (error) {
      // Handle database insertion error
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
