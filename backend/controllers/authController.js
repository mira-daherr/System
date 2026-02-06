const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

    console.log('🔑 About to sign token...');
    console.log('JWT_SECRET at signing time:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');

    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Token created successfully');

    await User.updateStatus(user.id, 'online');
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: 'online',
        created_at: user.created_at
      }
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

// ============================================
// NEW: REQUEST RESET CODE
// ============================================
exports.requestResetCode = async (req, res) => {
  try {
    console.log('📥 Reset code request received');
    console.log('Body:', req.body);

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Check if user exists
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Username not found'
      });
    }

    // Generate 6-digit code
    const resetCode = User.generateResetCode();
    console.log('🔑 Generated reset code:', resetCode);

    // Save code to database
    const saved = await User.saveResetCode(username, resetCode);
    
    if (!saved) {
      throw new Error('Failed to save reset code');
    }

    console.log('✅ Reset code saved successfully');

    return res.status(200).json({
      success: true,
      message: 'Reset code generated successfully',
      code: resetCode,
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('❌ Request reset code error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating reset code',
      error: error.message
    });
  }
};

// ============================================
// NEW: RESET PASSWORD WITH CODE
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    console.log('📥 Reset password request received');
    console.log('Body:', req.body);

    const { username, code, newPassword } = req.body;

    // Validate inputs
    if (!username || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, code, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long'
      });
    }

    console.log('Verifying reset code for username:', username);

    // Verify reset code
    const user = await User.verifyResetCode(username, code);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    console.log('✅ Reset code verified for user:', username);

    // Update password
    const updated = await User.updatePassword(username, newPassword);
    
    if (!updated) {
      throw new Error('Failed to update password');
    }

    // Clear reset code
    await User.clearResetCode(username);

    console.log('✅ Password updated successfully for user:', username);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password',
      error: error.message
    });
  }
};