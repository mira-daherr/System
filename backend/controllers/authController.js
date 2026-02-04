const User = require('../models/User');

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log('📥 Login request received');
    console.log('Body:', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isPasswordValid = User.verifyPassword(user, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    await User.updateStatus(user.id, 'online');
    console.log('✅ User logged in, status: online');

    const updatedUser = await User.findById(user.id);
    const safeUser = User.getSafeUser(updatedUser);
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: safeUser
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    console.log('📥 Logout request received');
    console.log('Full request body:', req.body);
    console.log('Type of req.body:', typeof req.body);

    const { id } = req.body;
    
    console.log('ID extracted:', id);
    console.log('Type of ID:', typeof id);

    if (!id) {
      console.log('❌ No ID provided');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('Searching for user with ID:', id);
    const user = await User.findById(id);
    console.log('User found:', user);

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.username, 'Current status:', user.status);

    await User.updateStatus(id, 'offline');
    console.log('✅ Status updated to offline');

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      userId: parseInt(id)
    });

  } catch (error) {
    console.error('❌ Logout error details:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: error.message
    });
  }
};