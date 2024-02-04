import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import cron from "node-cron"
import twilio from 'twilio';
// import task from '../../models/task';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = twilio(accountSid, authToken);
const fromPhoneNumber = '+14154841517';
const makeTwilioCall = async (Callmessage,toPhoneNumber) => {
  try {
    const call = await client.calls.create({
      twiml: Callmessage,
      to: toPhoneNumber,
      from: fromPhoneNumber,
    });

    console.log(`Twilio call SID: ${call.sid}`);
  } catch (error) {
    console.error('Error making Twilio call:', error);
  }
};
// Create a new user
export const createUser = async (req, res) => {
  const { id,phone_number,priority } = req.body;
  try {
    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ id });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create a new user
    const newUser = new User({ id,priority,phone_number });
    await newUser.save();
    console.log(newUser)
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    // Extract user ID from req.body
    const { userId } = req.body;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user from the database using the User model
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is found, send the user data in the response
    res.json(user);
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



