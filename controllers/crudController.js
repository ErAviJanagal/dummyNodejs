const User = require('../models/user');
const Joi = require('joi');
const { Op } = require('sequelize');
const path = require('path');
const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { upload  } = require('../helper');
const fs = require('fs');  // Import the Node.js fs module for file system operations

exports.signUp = async (req,res) => {
    res.render('register');

}
exports.signIn = async (req,res) => {
    res.render('login');

}
exports.register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            email: req.body.email,
          password: hashedPassword,
        });
        res.redirect('/signIn');
        // res.status(201).send('User registered successfully');
      } catch (error) {
        res.status(500).send(error.message);
      }
  };

exports.login = async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).send('User not found');
    }
  
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send('Invalid password');
    }
    const secretKey = process.env.SECRET_KEY;

    // Generate and send a JWT token
    const token = jwt.sign({ user: user }, secretKey);
  
    // Set the JWT token as a cookie
    res.cookie('jwtToken', token, { httpOnly: true });
    
    // res.json({ token });
    res.redirect('/list');
};
exports.list = async (req, res) => {
    try {
        const type = 1;
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        res.render('list', { success: successMessage, error: errorMessage, type: type ,req});
    }
    catch (error) {
      console.error('Error fetching users:.', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  exports.users = async (req, res) => {
    try {
        // console.log('dd');
      const { draw, start, length, order, columns, search } = req.query;
  
      const sortOrder = order[0].dir;
      const sortBy = columns[order[0].column].data;
  
      const whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search.value}%` } },
          { email: { [Op.like]: `%${search.value}%` } }
        ]
      };
  
      const users = await User.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        offset: parseInt(start),
        limit: parseInt(length)
      });
  
      res.json({
        draw: parseInt(draw),
        recordsTotal: users.count,
        recordsFiltered: users.count,
        data: users.rows
      });
    } catch (error) {
      console.error('Error fetching users for DataTables:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  exports.addUser = async (req, res) => {
    // console.log(req.body);
    const { name, email } = req.body;

    try {
       
        const newUser = new User();
        newUser.name = name;
        newUser.email = email;
        newUser.role = "user";
        newUser.image = req.file ? req.file.filename : null;
        await newUser.save();
        // Create a nodemailer transporter using your Gmail account
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'eravijanagal@gmail.com', // Your Gmail email address
            pass: 'xpwocjlcquktbozw' // Your Gmail password or an application-specific password
            }
        });
        
        // Email options
        const mailOptions = {
            from: 'eravijanagal@gmail.com', // Sender's email address
            to: newUser.email, // Receiver's email address
            subject: 'mail using nodejs 🐱‍🏍🐱‍🏍🐱‍🏍🐱‍👤',
            text: 'hi chitti'
        };
        
        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
            console.error('Error sending email:', error);
            } else {
            console.log('Email sent:', info.response);
            }
        });
        // Log the newly created user data (for demonstration purposes)
        //console.log('Stored User Data:', newUser);
        req.flash('success', 'User added successfully!');
        // Redirect back to the page with the DataTable
        res.redirect('list');
    } catch (error) {
        console.error('Error adding user:', error);
        req.flash('error', 'Error adding user.');
        res.status(500).send('Internal Server Error');
    }
}

exports.editUser = async(req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        // console.log(user);
        if (!user) {
            req.flash('error', 'User not found!');
            res.redirect('/list');

        }
        type = 2;
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        res.render('list', { user: user, success: successMessage, error: errorMessage, type: type,req});
      } catch (error) {
        console.error('Error fetching user for edit:', error);
        res.status(500).send('Internal Server Error');
      }
}

exports.updateUser = async (req, res) => {
    const { userId, name, email } = req.body;

    try {
        // Find the user by ID
        const user = await User.findByPk(userId);

        // Check if the user exists
        if (!user) {
            req.flash('error', 'User not found!');
            return res.redirect('/list');  // return added to terminate the function after redirect
        }

        // Update user data
        user.name = name;
        user.email = email;
        user.email = "user";

        if (req.file) {
            // Delete the old image if it exists
            if (user && user.get('image') !== null) {
                const imagePath = path.join(__dirname, '..', 'uploads', user.get('image'));
                fs.unlinkSync(imagePath);
            }
            user.image = req.file.filename;
        }


        // Save the changes to the database
        await user.save();

        // Flash success message
        req.flash('success', 'User updated successfully');
        res.redirect('/list');
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect('/list');
    }
};

  exports.deleteUser = async(req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        // console.log(user);
        if (!user) {
            req.flash('error', 'User not found!');
            res.redirect('/list');

        }
        await user.destroy();
  
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        req.flash('success', 'User deleted successfully');

        res.redirect('/list');
      } catch (error) {
        console.error('Error fetching user for edit:', error);
        res.status(500).send('Internal Server Error');
      }
}