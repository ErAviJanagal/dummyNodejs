const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Get the JWT token from the request header or cookies, depending on your implementation
  const token = req.headers.authorization || req.cookies.jwtToken;

  if (!token) {
    return res.redirect('signIn');
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.redirect('signIn');
    }

    // Destructure the user object from the decoded payload
    const { user } = decoded;
    // Check the user's role
    if (user && user.role !== 'admin') {
      // Redirect non-admin users to the login page
      return res.redirect('signIn');
    }

    // Attach the user information to the request for further use in routes
    req.user = user;
    // Continue to the next middleware or route handler
    next();
  });
}

module.exports = authenticateToken;
